import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/controllers/auth_controller.dart';
import '../models/doc_request_ticket_model.dart';

final ticketRepositoryProvider = Provider<TicketRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return TicketRepository(dio);
});

class TicketRepository {
  final Dio _dio;

  TicketRepository(this._dio);

  /// Creates a documentation request ticket when RAG cannot verify or finds missing documentation
  Future<DocRequestTicketModel> createTicket({
    required String userQuery,
    String? equipmentId,
    String? equipmentName,
    String? searchContext,
  }) async {
    try {
      final payload = <String, dynamic>{
        'userQuery': userQuery,
      };
      if (equipmentId != null) payload['equipmentId'] = equipmentId;
      if (equipmentName != null) payload['equipmentName'] = equipmentName;
      if (searchContext != null) payload['searchContext'] = searchContext;

      final response = await _dio.post(
        '/tickets',
        data: payload,
      );

      final data = response.data['data'] as Map<String, dynamic>;
      return DocRequestTicketModel.fromJson(data);
    } catch (e) {
      // Offline fallback: generate client-side ticket receipt
      return DocRequestTicketModel(
        id: 'offline-${DateTime.now().millisecondsSinceEpoch}',
        ticketNumber: 'DOC-REQ-PENDING',
        userQuery: userQuery,
        equipmentId: equipmentId,
        equipmentName: equipmentName,
        searchContext: searchContext,
        status: 'open',
        createdAt: DateTime.now(),
      );
    }
  }

  /// Fetches existing tickets (e.g., for document owner review)
  Future<List<DocRequestTicketModel>> getTickets({String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;

      final response = await _dio.get(
        '/tickets',
        queryParameters: queryParams,
      );

      final data = response.data['data'] as List;
      return data
          .whereType<Map<String, dynamic>>()
          .map((item) => DocRequestTicketModel.fromJson(item))
          .toList();
    } catch (_) {
      return [];
    }
  }
}
