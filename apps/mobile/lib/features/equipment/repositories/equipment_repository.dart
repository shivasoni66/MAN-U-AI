import 'package:dio/dio.dart';
import '../models/equipment_model.dart';
import '../../offline/models/area_pack_model.dart';

class EquipmentRepository {
  final Dio dio;

  EquipmentRepository({required this.dio});

  /// Fetches all registered plant equipment records.
  Future<List<EquipmentModel>> getEquipment() async {
    final response = await dio.get('/equipment');
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return (data['data'] as List)
          .whereType<Map<String, dynamic>>()
          .map((item) => EquipmentModel.fromJson(item))
          .toList();
    }
    return [];
  }

  /// Fetches offline documentation area pack for dead-zone plant operation.
  Future<AreaPackModel> getOfflinePack(String equipmentId) async {
    final response = await dio.get('/equipment/$equipmentId/offline-pack');
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is Map<String, dynamic>) {
      return AreaPackModel.fromJson(data['data'] as Map<String, dynamic>);
    }
    throw Exception('Failed to load offline area pack');
  }
}
