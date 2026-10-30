class SafetyPreconditionsModel {
  final List<String> warnings;
  final List<String> ppeRequired;
  final List<String> lotoSteps;
  final String? isOverdueWarning;

  const SafetyPreconditionsModel({
    this.warnings = const [],
    this.ppeRequired = const [],
    this.lotoSteps = const [],
    this.isOverdueWarning,
  });

  bool get isEmpty =>
      warnings.isEmpty &&
      ppeRequired.isEmpty &&
      lotoSteps.isEmpty &&
      (isOverdueWarning == null || isOverdueWarning!.isEmpty);

  bool get isNotEmpty => !isEmpty;

  factory SafetyPreconditionsModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedWarnings = [];
    if (json['warnings'] is List) {
      parsedWarnings = (json['warnings'] as List).map((e) => e.toString()).toList();
    }

    List<String> parsedPpe = [];
    if (json['ppeRequired'] is List) {
      parsedPpe = (json['ppeRequired'] as List).map((e) => e.toString()).toList();
    }

    List<String> parsedLoto = [];
    if (json['lotoSteps'] is List) {
      parsedLoto = (json['lotoSteps'] as List).map((e) => e.toString()).toList();
    }

    return SafetyPreconditionsModel(
      warnings: parsedWarnings,
      ppeRequired: parsedPpe,
      lotoSteps: parsedLoto,
      isOverdueWarning: json['isOverdueWarning']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'warnings': warnings,
      'ppeRequired': ppeRequired,
      'lotoSteps': lotoSteps,
      if (isOverdueWarning != null) 'isOverdueWarning': isOverdueWarning,
    };
  }
}

class SuggestedTicketModel {
  final String query;
  final String? equipmentId;
  final String reason;

  const SuggestedTicketModel({
    required this.query,
    this.equipmentId,
    required this.reason,
  });

  factory SuggestedTicketModel.fromJson(Map<String, dynamic> json) {
    return SuggestedTicketModel(
      query: json['query']?.toString() ?? '',
      equipmentId: json['equipmentId']?.toString(),
      reason: json['reason']?.toString() ?? 'Low retrieval confidence',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'query': query,
      if (equipmentId != null) 'equipmentId': equipmentId,
      'reason': reason,
    };
  }
}

