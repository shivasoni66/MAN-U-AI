import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:manuai_mobile/core/theme/app_theme.dart';
import 'package:manuai_mobile/features/chat/models/chat_message_model.dart';
import 'package:manuai_mobile/features/chat/models/safety_preconditions_model.dart';
import 'package:manuai_mobile/features/chat/views/widgets/chat_bubble.dart';
import 'package:manuai_mobile/features/chat/views/widgets/plant_glossary_modal.dart';
import 'package:manuai_mobile/features/chat/views/widgets/safety_preconditions_card.dart';
import 'package:manuai_mobile/features/diagram/models/diagram_annotation_model.dart';
import 'package:manuai_mobile/features/diagram/repositories/diagram_repository.dart';
import 'package:manuai_mobile/features/diagram/views/interactive_diagram_viewer_screen.dart';
import 'package:manuai_mobile/features/offline/models/area_pack_model.dart';
import 'package:manuai_mobile/features/offline/services/offline_area_storage.service.dart';
import 'package:manuai_mobile/core/storage/secure_storage_service.dart';

class _MockDiagramRepository implements DiagramRepository {
  @override
  Future<DiagramAnnotationModel> getAnnotations(String figureId) async {
    return DiagramRepository.demoExplodedPumpDiagram;
  }

  @override
  Future<DiagramAnnotationModel> annotateWithVision(String figureId) async {
    return DiagramRepository.demoExplodedPumpDiagram;
  }
}

void main() {
  group('Feature 1: Plant Glossary & Slang Modal Widget Tests', () {
    testWidgets('renders search field, slang items, and filters on query', (tester) async {
      String? selectedTerm;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: PlantGlossaryModal(
              onSelectTerm: (term) {
                selectedTerm = term;
              },
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Plant Glossary & Slang Mapping'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);

      // Search for "blower"
      await tester.enterText(find.byType(TextField), 'blower');
      await tester.pumpAndSettle();

      expect(find.text('the blower'), findsOneWidget);
      expect(find.textContaining('Induced Draft Centrifugal Fan'), findsOneWidget);

      // Tap the item to select
      await tester.tap(find.text('the blower'));
      await tester.pumpAndSettle();

      expect(selectedTerm, equals('Induced Draft Centrifugal Fan'));
    });
  });

  group('Feature 2: Offline Area Storage & BM25 Passage Search Unit Tests', () {
    test('OfflineAreaStorageService caches area pack and searches ranked passages', () async {
      final storage = SecureStorageService();
      final offlineService = OfflineAreaStorageService(storage);

      final testPack = AreaPackModel(
        equipmentId: 'eq-p102',
        equipmentName: 'Slurry Pump P-102',
        equipmentType: 'Centrifugal Slurry Pump',
        versionHash: 'hash-abc-12345',
        generatedAt: DateTime.now(),
        chunks: const [
          AreaPackChunkModel(
            id: 'chunk-1',
            documentId: 'doc-1',
            documentTitle: 'P-102 Manual',
            page: 12,
            section: 'Seal Replacement',
            text: 'Torque gland follower studs to 45 Nm in an alternating cross pattern to ensure even face compression.',
            safetyCategory: 'general_procedure',
            ppeTags: ['safety_glasses'],
          ),
          AreaPackChunkModel(
            id: 'chunk-2',
            documentId: 'doc-1',
            documentTitle: 'P-102 Manual',
            page: 14,
            section: 'LOTO Protocol',
            text: 'DANGER: Lock out breaker 480V-M4 and tag out before opening bearing housing. Verify zero pressure on gauge.',
            safetyCategory: 'loto_isolation',
            ppeTags: ['face_shield', 'dielectric_gloves'],
          ),
        ],
      );

      await offlineService.saveAreaPack(testPack);

      final hasPack = await offlineService.hasOfflinePack('eq-p102');
      expect(hasPack, isTrue);

      // Search offline passages for torque
      final result = await offlineService.searchOfflinePassages('eq-p102', 'gland stud torque specs');
      expect(result.answer, contains('45 Nm'));
      expect(result.answer, contains('OFFLINE DEAD-ZONE FALLBACK'));
      expect(result.citations.length, greaterThanOrEqualTo(1));
      expect(result.citations[0].page, equals(12));
    });
  });

  group('Feature 3: Refusal-to-Fix Loop 1-Tap Ticket Widget Tests', () {
    testWidgets('renders 1-tap Request Documentation button when can verify fails', (tester) async {
      const msg = ChatMessageModel(
        role: 'assistant',
        content: 'I cannot verify the nitrogen pre-charge pressure in the current manual.',
        warningLevel: 'caution',
        confidenceScore: 0.25,
        suggestedTicket: SuggestedTicketModel(
          query: 'What is the nitrogen pre-charge pressure for accumulator ACC-02?',
          reason: 'Missing nitrogen pre-charge pressure for accumulator ACC-02 in manual.',
        ),
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: const Scaffold(
            body: SingleChildScrollView(
              child: ChatBubble(
                message: msg,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('DOCUMENTATION GAP DETECTED'), findsOneWidget);
      expect(find.text('Request Documentation From Owner'), findsOneWidget);
      expect(find.textContaining('Missing nitrogen pre-charge pressure'), findsOneWidget);
    });
  });

  group('Feature 4: Safety Preconditions Pinned First Widget Tests', () {
    testWidgets('renders hazard warning, required PPE chips, and interactive LOTO checklist', (tester) async {
      const preconditions = SafetyPreconditionsModel(
        warnings: ['High pressure hydraulic fluid injection hazard (3000 PSI)'],
        ppeRequired: ['Face Shield', 'Nitrile Gloves', 'Steel Toe Boots'],
        lotoSteps: [
          'De-energize main 480V disconnect at MCC-02',
          'Bleed accumulator bleed valve to 0 PSI',
        ],
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: const Scaffold(
            body: SingleChildScrollView(
              child: SafetyPreconditionsCard(
                preconditions: preconditions,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('SAFETY PRECONDITIONS PINNED FIRST'), findsOneWidget);
      expect(find.textContaining('High pressure hydraulic fluid injection hazard'), findsOneWidget);
      expect(find.text('Face Shield'), findsOneWidget);
      expect(find.text('Nitrile Gloves'), findsOneWidget);
      expect(find.text('Steel Toe Boots'), findsOneWidget);
      expect(find.textContaining('De-energize main 480V disconnect'), findsOneWidget);
      expect(find.textContaining('Bleed accumulator bleed valve'), findsOneWidget);

      // Verify interactive checkboxes can be tapped
      final checkboxIcons = find.byIcon(Icons.check_box_outline_blank);
      expect(checkboxIcons, findsNWidgets(2));

      await tester.tap(checkboxIcons.first);
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.check_box), findsOneWidget);
    });
  });

  group('Feature 5: Tap-the-Part Interactive Diagram Viewer Widget Tests', () {
    testWidgets('renders diagram canvas and interactive part hotspots', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            diagramRepositoryProvider.overrideWithValue(_MockDiagramRepository()),
          ],
          child: MaterialApp(
            theme: AppTheme.darkTheme,
            home: const InteractiveDiagramViewerScreen(
              figureId: 'FIG-P102-EXPLODED',
              title: 'P-102 Slurry Pump Exploded Assembly',
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('P-102 Slurry Pump Exploded Assembly'), findsOneWidget);
      expect(find.textContaining('Tap any numbered part callout'), findsOneWidget);
      expect(find.byType(InteractiveViewer), findsOneWidget);

      // Verify AI Vision detection trigger is present in AppBar
      expect(find.byIcon(Icons.auto_awesome), findsOneWidget);
    });
  });
}
