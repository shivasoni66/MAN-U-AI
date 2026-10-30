class DiagramHotspotModel {
  final String id;
  final String partNumber;
  final String partName;
  final List<double> boundingBox; // [ymin, xmin, ymax, xmax] 0-1000
  final int? manualPage;
  final String? description;

  const DiagramHotspotModel({
    required this.id,
    required this.partNumber,
    required this.partName,
    required this.boundingBox,
    this.manualPage,
    this.description,
  });

  factory DiagramHotspotModel.fromJson(Map<String, dynamic> json) {
    List<double> box = [0, 0, 0, 0];
    if (json['boundingBox'] is List) {
      box = (json['boundingBox'] as List)
          .map((v) => (v is num) ? v.toDouble() : 0.0)
          .toList();
    }
    return DiagramHotspotModel(
      id: json['id']?.toString() ?? '',
      partNumber: json['partNumber']?.toString() ?? 'Item',
      partName: json['partName']?.toString() ?? 'Part',
      boundingBox: box,
      manualPage: (json['manualPage'] is num) ? (json['manualPage'] as num).toInt() : null,
      description: json['description']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'partNumber': partNumber,
      'partName': partName,
      'boundingBox': boundingBox,
      if (manualPage != null) 'manualPage': manualPage,
      if (description != null) 'description': description,
    };
  }
}

class DiagramAnnotationModel {
  final String id;
  final String figureId;
  final String documentId;
  final String documentTitle;
  final int page;
  final String? title;
  final List<DiagramHotspotModel> hotspots;

  const DiagramAnnotationModel({
    required this.id,
    required this.figureId,
    required this.documentId,
    required this.documentTitle,
    required this.page,
    this.title,
    this.hotspots = const [],
  });

  factory DiagramAnnotationModel.fromJson(Map<String, dynamic> json) {
    List<DiagramHotspotModel> spots = [];
    if (json['hotspots'] is List) {
      spots = (json['hotspots'] as List)
          .whereType<Map<String, dynamic>>()
          .map((h) => DiagramHotspotModel.fromJson(h))
          .toList();
    }

    return DiagramAnnotationModel(
      id: json['id']?.toString() ?? '',
      figureId: json['figureId']?.toString() ?? '',
      documentId: json['documentId']?.toString() ?? '',
      documentTitle: json['documentTitle']?.toString() ?? 'Manual Schematic',
      page: (json['page'] is num) ? (json['page'] as num).toInt() : 1,
      title: json['title']?.toString(),
      hotspots: spots,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'figureId': figureId,
      'documentId': documentId,
      'documentTitle': documentTitle,
      'page': page,
      if (title != null) 'title': title,
      'hotspots': hotspots.map((h) => h.toJson()).toList(),
    };
  }
}

