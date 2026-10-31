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

  /// SimReady Conveyor Belt A61 component diagram fixture
  static final DiagramAnnotationModel conveyorBeltDiagram = DiagramAnnotationModel(
    id: 'demo-conveyor-belt-a61',
    figureId: 'FIG-CONVEYOR-BELT-A61',
    documentId: 'doc-cb-a61',
    documentTitle: 'SimReady Conveyor Belt A61 Operation & Maintenance Manual',
    page: 6,
    title: 'Conveyor Belt A61 Exploded Assembly & Component Diagram',
    hotspots: const [
      DiagramHotspotModel(
        id: 'part-cb-1',
        partNumber: 'CB-A61-01',
        partName: 'Conveyor Drive Motor & Gearbox Assembly',
        boundingBox: [260, 100, 440, 280],
        manualPage: 8,
        description: '480V 3-phase high-torque gearmotor drive unit with enclosed planetary reduction gearbox and direct drive sprocket.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-2',
        partNumber: 'CB-A61-02',
        partName: 'Precision Machined Idler Roller Array (x36)',
        boundingBox: [340, 260, 500, 680],
        manualPage: 12,
        description: 'Array of 36 precision brushed aluminium idler rollers with double-sealed ABEC-5 bearings and low-friction center shafts.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-3',
        partNumber: 'CB-A61-03',
        partName: 'High-Traction Vulcanized Conveyor Belt',
        boundingBox: [290, 220, 470, 780],
        manualPage: 15,
        description: 'Multi-ply polyester-nylon reinforced vulcanized synthetic rubber belt with chevron traction profile and vulcanized endless splice.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-4',
        partNumber: 'CB-A61-04',
        partName: 'Optical Inspection Scanner & Vision Module',
        boundingBox: [140, 440, 310, 640],
        manualPage: 22,
        description: 'Integrated optical inspection scanning module with scratch-resistant acrylic protective shield, high-speed line scan sensors, and LED illumination.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-5',
        partNumber: 'CB-A61-05',
        partName: 'Emergency Stop & Operator Pushbutton Console',
        boundingBox: [220, 720, 360, 880],
        manualPage: 5,
        description: 'Dual-channel safety rated latching mushroom E-Stop button with illuminated Jog/Start/Stop control switches in IP67 sealed enclosure.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-6',
        partNumber: 'CB-A61-06',
        partName: 'Extruded Aluminum Load-Bearing Frame Rails',
        boundingBox: [460, 140, 680, 860],
        manualPage: 7,
        description: 'Anodized 80/20 extruded aluminum structural side rails with integrated T-slot mounting tracks, cross-braces, and vibration-damping leveling feet.',
      ),
      DiagramHotspotModel(
        id: 'part-cb-7',
        partNumber: 'CB-A61-07',
        partName: 'Pneumatic Automatic Belt Tensioner & Tracking Guide',
        boundingBox: [480, 740, 640, 920],
        manualPage: 19,
        description: 'Dual-cylinder pneumatic tensioning mechanism maintaining continuous 16.5 kN/m belt preload with auto-centering tracking rollers.',
      ),
    ],
  );

  /// SimReady Turbocompressor B01 component diagram fixture
  static final DiagramAnnotationModel turbocompressorDiagram = DiagramAnnotationModel(
    id: 'demo-turbocompressor-b01',
    figureId: 'FIG-TURBOCOMPRESSOR-B01',
    documentId: 'doc-tc-b01',
    documentTitle: 'SimReady Turbocompressor B01 Operation & Maintenance Manual',
    page: 12,
    title: 'Turbocompressor B01 Exploded Assembly & Component Diagram',
    hotspots: const [
      DiagramHotspotModel(
        id: 'part-tc-1',
        partNumber: 'TC-B01-01',
        partName: 'Cast Titanium Compressor Impeller Wheel',
        boundingBox: [280, 180, 460, 360],
        manualPage: 14,
        description: 'Precision CNC milled 5-axis aerospace titanium compressor impeller with backward-curved splitter blades rated to 65,000 RPM.',
      ),
      DiagramHotspotModel(
        id: 'part-tc-2',
        partNumber: 'TC-B01-02',
        partName: 'Involute Compressor Volute Casing & Diffuser',
        boundingBox: [200, 320, 520, 640],
        manualPage: 18,
        description: 'Ductile cast alloy scroll housing with vaned diffuser ring optimizing static pressure recovery up to 4.2:1 pressure ratio.',
      ),
      DiagramHotspotModel(
        id: 'part-tc-3',
        partNumber: 'TC-B01-03',
        partName: 'High-Speed Ceramic Journal & Thrust Bearings',
        boundingBox: [340, 420, 480, 560],
        manualPage: 24,
        description: 'Dual angular contact silicon nitride ceramic ball bearing cartridge with floating ring damper and pressurized oil lubrication.',
      ),
      DiagramHotspotModel(
        id: 'part-tc-4',
        partNumber: 'TC-B01-04',
        partName: 'Pneumatic Bypass Blow-Off Valve Actuator',
        boundingBox: [120, 520, 280, 720],
        manualPage: 9,
        description: 'High-response anti-surge recirculation bypass valve preventing aerodynamic blade stall during sudden throttle deceleration.',
      ),
      DiagramHotspotModel(
        id: 'part-tc-5',
        partNumber: 'TC-B01-05',
        partName: 'Center Housing & Oil Scavenge Passages',
        boundingBox: [360, 480, 540, 700],
        manualPage: 29,
        description: 'Water-cooled center bearing housing with integrated oil feed gallery and gravity drain scavenge port.',
      ),
      DiagramHotspotModel(
        id: 'part-tc-6',
        partNumber: 'TC-B01-06',
        partName: 'Radial Inflow Gas Turbine Wheel & Heat Shield',
        boundingBox: [300, 680, 500, 880],
        manualPage: 32,
        description: 'Inconel 713C high-temperature nickel superalloy radial turbine rotor designed for 950°C continuous exhaust inlet gas temperatures.',
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
      if (figureId.toUpperCase().contains('CONVEYOR') || figureId.toUpperCase().contains('A61')) {
        return conveyorBeltDiagram;
      }
      if (figureId.toUpperCase().contains('TURBO') ||
          figureId.toUpperCase().contains('COMPRESSOR') ||
          figureId.toUpperCase().contains('B01')) {
        return turbocompressorDiagram;
      }
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
      if (figureId.toUpperCase().contains('CONVEYOR') || figureId.toUpperCase().contains('A61')) {
        return conveyorBeltDiagram;
      }
      if (figureId.toUpperCase().contains('TURBO') ||
          figureId.toUpperCase().contains('COMPRESSOR') ||
          figureId.toUpperCase().contains('B01')) {
        return turbocompressorDiagram;
      }
      return demoExplodedPumpDiagram;
    }
  }
}

