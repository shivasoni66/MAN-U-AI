import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../chat/models/chat_response_model.dart';
import '../../chat/models/citation_model.dart';
import '../../chat/models/safety_preconditions_model.dart';
import '../models/area_pack_model.dart';
import '../../../core/storage/secure_storage_service.dart';

final offlineAreaStorageServiceProvider = Provider<OfflineAreaStorageService>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return OfflineAreaStorageService(secureStorage);
});

class OfflineAreaStorageService {
  final SecureStorageService _storage;
  static const String _keyPrefix = 'area_pack_';

  // In-memory cache for ultra-fast dead zone retrieval
  final Map<String, AreaPackModel> _memoryPacks = {};

  OfflineAreaStorageService(this._storage);

  /// Saves a downloaded Area Pack to local storage
  Future<void> saveAreaPack(AreaPackModel pack) async {
    _memoryPacks[pack.equipmentId] = pack;
    try {
      final jsonStr = jsonEncode(pack.toJson());
      await _storage.write('$_keyPrefix${pack.equipmentId}', jsonStr);
    } catch (_) {
      // Memory cache is preserved
    }
  }

  /// Retrieves cached Area Pack for equipment
  Future<AreaPackModel?> getAreaPack(String equipmentId) async {
    if (_memoryPacks.containsKey(equipmentId)) {
      return _memoryPacks[equipmentId];
    }

    try {
      final raw = await _storage.read('$_keyPrefix$equipmentId');
      if (raw != null && raw.isNotEmpty) {
        final decoded = jsonDecode(raw) as Map<String, dynamic>;
        final pack = AreaPackModel.fromJson(decoded);
        _memoryPacks[equipmentId] = pack;
        return pack;
      }
    } catch (_) {}

    return null;
  }

  /// Checks if equipment has an offline area pack cached
  Future<bool> hasOfflinePack(String equipmentId) async {
    if (_memoryPacks.containsKey(equipmentId)) return true;
    final raw = await _storage.read('$_keyPrefix$equipmentId');
    return raw != null && raw.isNotEmpty;
  }

  /// Client-side Dead-Zone Retrieval Engine:
  /// Performs BM25-like term frequency and token matching across cached manual chunks.
  Future<ChatResponseModel> searchOfflinePassages(
    String equipmentId,
    String query, {
    String? equipmentName,
  }) async {
    final pack = await getAreaPack(equipmentId);
    final eqTitle = equipmentName ?? pack?.equipmentName ?? 'Plant Equipment';

    if (pack == null || pack.chunks.isEmpty) {
      return ChatResponseModel(
        answer:
            '> 📴 **OFFLINE RETRIEVAL-ONLY MODE (DEAD ZONE)**\n\n'
            'No offline documentation pack is cached on this device for **$eqTitle**.\n\n'
            'When network connectivity is restored, tap **Download Area Pack** to store approved SOPs and diagrams for offline plant use.',
        warningLevel: 'caution',
        confidenceScore: 0.1,
        provider: 'offline-dead-zone-cache',
        suggestedTicket: SuggestedTicketModel(
          query: query,
          equipmentId: equipmentId,
          reason: 'Offline dead zone: no area pack cached for $eqTitle',
        ),
      );
    }

    final queryWords = query
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s]'), ' ')
        .split(RegExp(r'\s+'))
        .where((w) => w.length > 2)
        .toList();

    // Score cached chunks based on query term frequency and section titles
    final scoredChunks = <MapEntry<AreaPackChunkModel, double>>[];
    for (final chunk in pack.chunks) {
      double score = 0.0;
      final textLower = chunk.text.toLowerCase();
      final secLower = (chunk.section ?? '').toLowerCase();

      for (final word in queryWords) {
        if (textLower.contains(word)) score += 1.0;
        if (secLower.contains(word)) score += 2.0;
      }

      // Bonus if chunk is a hazard or LOTO step
      if (chunk.safetyCategory == 'loto_isolation') score += 0.5;
      if (chunk.safetyCategory == 'hazard_warning') score += 0.5;

      if (score > 0) {
        scoredChunks.add(MapEntry(chunk, score));
      }
    }

    scoredChunks.sort((a, b) => b.value.compareTo(a.value));
    final topChunks = scoredChunks.take(3).map((e) => e.key).toList();

    if (topChunks.isEmpty) {
      // Fallback to first 2 chunks of manual if no keyword match
      topChunks.addAll(pack.chunks.take(2));
    }

    // Extract safety preconditions from the matched or primary chunks
    final warnings = <String>[];
    final ppeSet = <String>{};
    final lotoSteps = <String>[];

    for (final c in pack.chunks) {
      if (c.safetyCategory == 'hazard_warning' && warnings.length < 3) {
        warnings.add(c.text.length > 200 ? '${c.text.substring(0, 200)}...' : c.text);
      }
      if (c.safetyCategory == 'loto_isolation' && lotoSteps.length < 3) {
        lotoSteps.add(c.text.length > 200 ? '${c.text.substring(0, 200)}...' : c.text);
      }
      ppeSet.addAll(c.ppeTags);
    }

    final citations = topChunks
        .map(
          (c) => CitationModel(
            documentId: c.documentId,
            documentTitle: c.documentTitle,
            revision: 'Offline Cached Pack',
            page: c.page,
            section: c.section,
            excerpt: c.text,
            safetyCategory: c.safetyCategory,
          ),
        )
        .toList();

    final buffer = StringBuffer();
    buffer.writeln('> 📴 **[OFFLINE DEAD-ZONE FALLBACK: DIRECT MANUAL PASSAGES]**');
    buffer.writeln(
      '> Cloud LLM is unreachable. Serving ranked, verified SOP passages directly from cached local memory for **$eqTitle**.\n',
    );

    for (var i = 0; i < topChunks.length; i++) {
      final c = topChunks[i];
      buffer.writeln('### [Passage ${i + 1}] ${c.documentTitle} (Page ${c.page})');
      if (c.section != null) buffer.writeln('*Section: ${c.section}*');
      buffer.writeln('\n> ${c.text}\n');
    }

    return ChatResponseModel(
      answer: buffer.toString(),
      citations: citations,
      warningLevel: lotoSteps.isNotEmpty || warnings.isNotEmpty ? 'critical' : 'none',
      confidenceScore: 0.80,
      provider: 'client-offline-dead-zone-cache',
      safetyPreconditions: SafetyPreconditionsModel(
        warnings: warnings,
        ppeRequired: ppeSet.toList(),
        lotoSteps: lotoSteps,
        isOverdueWarning: null,
      ),
    );
  }
}

