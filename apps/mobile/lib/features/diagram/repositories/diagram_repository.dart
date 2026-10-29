import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/controllers/auth_controller.dart';
import '../models/diagram_annotation_model.dart';

final diagramRepositoryProvider = Provider<DiagramRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return DiagramRepository(dio);
});

class DiagramRepository {
  final Dio _dio;

  DiagramRepository(this._dio);

  /// Default high-fidelity exploded pump fixture for offline & immediate demonstration
  static final DiagramAnnotationModel demoExplodedPumpDiagram = DiagramAnnotationModel(
    id: 'demo-pump-exploded',
    figureId: 'FIG-P102-EXPLODED',
    documentId: 'doc-sp102',
    documentTitle: 'Slurry Pump P-102 Maintenance & Rebuild Manual',
    page: 16,
    title: 'Slurry Pump P-102 Exploded Power End & Wet End Assembly',
    hotspots: const [
      DiagramHotspotModel(
        id: 'part-1',
        partNumber: 'SP-102-01',
        partName: 'Bearing Cartridge & Labyrinth Seals',
        boundingBox: [180, 120, 320, 290],
        manualPage: 14,
        description: 'Cast iron bearing housing with purge grease fittings and dual labyrinth seals.',
      ),
      DiagramHotspotModel(
        id: 'part-2',
        partNumber: 'SP-102-02',
        partName: 'Drive Shaft & Keyway Assembly',
        boundingBox: [220, 280, 340, 500],
        manualPage: 16,
        description: 'High-tensile forged steel shaft with precision ground bearing journals.',
      ),
      DiagramHotspotModel(
        id: 'part-3',
        partNumber: 'SP-102-03',
        partName: 'Mechanical Seal Cartridge (Primary Barrier)',
        boundingBox: [310, 480, 460, 620],
        manualPage: 22,
        description: 'Silicon carbide vs tungsten carbide cartridge seal assembly with viton O-rings.',
      ),
      DiagramHotspotModel(
        id: 'part-4',
        partNumber: 'SP-102-04',
        partName: 'Impeller Closed 4-Vane High Chrome',
        boundingBox: [420, 580, 620, 780],
        manualPage: 28,
        description: '28% high-chrome alloy abrasive slurry impeller with pump-out back vanes.',
      ),
      DiagramHotspotModel(
        id: 'part-5',
        partNumber: 'SP-102-05',
        partName: 'Throatbush & Suction Liner Assembly',
        boundingBox: [460, 720, 680, 880],
        manualPage: 31,
        description: 'Replaceable wear liner with tapered axial clearance adjustment screws.',
      ),
      DiagramHotspotModel(
        id: 'part-6',
        partNumber: 'SP-102-06',
        partName: 'Pump Casing Volute Half (Front / Suction)',
        boundingBox: [580, 520, 840, 890],
        manualPage: 34,
        description: 'Ductile iron split outer casing with 250 PSI rated flanged suction nozzle.',
      ),
    ],
  );

  /// Fetches diagram part annotations from API or falls back to demo fixture
  Future<DiagramAnnotationModel> getAnnotations(String figureId) async {
    try {
      final response = await _dio.get('/diagrams/$figureId');
      final data = response.data['data'] as Map<String, dynamic>;
      return DiagramAnnotationModel.fromJson(data);
    } catch (_) {
      return demoExplodedPumpDiagram;
    }
  }

  /// Triggers Gemini Vision annotation on the diagram
  Future<DiagramAnnotationModel> annotateWithVision(String figureId) async {
    try {
      final response = await _dio.post('/diagrams/$figureId/annotate');
      final data = response.data['data'] as Map<String, dynamic>;
      return DiagramAnnotationModel.fromJson(data);
    } catch (_) {
      return demoExplodedPumpDiagram;
    }
  }
}

