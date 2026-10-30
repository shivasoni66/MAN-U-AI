class AreaPackChunkModel {
  final String id;
  final String documentId;
  final String documentTitle;
  final int page;
  final String? section;
  final String text;
  final String? safetyCategory;
  final List<String> ppeTags;

  const AreaPackChunkModel({
    required this.id,
    required this.documentId,
    required this.documentTitle,
    required this.page,
    this.section,
    required this.text,
    this.safetyCategory,
    this.ppeTags = const [],
  });

  factory AreaPackChunkModel.fromJson(Map<String, dynamic> json) {
    List<String> tags = [];
    if (json['ppeTags'] is List) {
      tags = (json['ppeTags'] as List).map((e) => e.toString()).toList();
    }
    return AreaPackChunkModel(
      id: json['id']?.toString() ?? '',
      documentId: json['documentId']?.toString() ?? '',
      documentTitle: json['documentTitle']?.toString() ?? 'Document',
      page: (json['page'] is num) ? (json['page'] as num).toInt() : 1,
      section: json['section']?.toString(),
      text: json['text']?.toString() ?? '',
      safetyCategory: json['safetyCategory']?.toString(),
      ppeTags: tags,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'documentId': documentId,
      'documentTitle': documentTitle,
      'page': page,
      if (section != null) 'section': section,
      'text': text,
      if (safetyCategory != null) 'safetyCategory': safetyCategory,
      'ppeTags': ppeTags,
    };
  }
}

class AreaPackModel {
  final String equipmentId;
  final String equipmentName;
  final String equipmentType;
  final String? model;
  final String versionHash;
  final DateTime generatedAt;
  final List<AreaPackChunkModel> chunks;

  const AreaPackModel({
    required this.equipmentId,
    required this.equipmentName,
    required this.equipmentType,
    this.model,
    required this.versionHash,
    required this.generatedAt,
    this.chunks = const [],
  });

  factory AreaPackModel.fromJson(Map<String, dynamic> json) {
    List<AreaPackChunkModel> parsedChunks = [];
    if (json['chunks'] is List) {
      parsedChunks = (json['chunks'] as List)
          .whereType<Map<String, dynamic>>()
          .map((c) => AreaPackChunkModel.fromJson(c))
          .toList();
    }

    return AreaPackModel(
      equipmentId: json['equipmentId']?.toString() ?? '',
      equipmentName: json['equipmentName']?.toString() ?? '',
      equipmentType: json['equipmentType']?.toString() ?? '',
      model: json['model']?.toString(),
      versionHash: json['versionHash']?.toString() ?? '',
      generatedAt: DateTime.tryParse(json['generatedAt']?.toString() ?? '') ?? DateTime.now(),
      chunks: parsedChunks,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'equipmentId': equipmentId,
      'equipmentName': equipmentName,
      'equipmentType': equipmentType,
      if (model != null) 'model': model,
      'versionHash': versionHash,
      'generatedAt': generatedAt.toIso8601String(),
      'chunks': chunks.map((c) => c.toJson()).toList(),
    };
  }
}

