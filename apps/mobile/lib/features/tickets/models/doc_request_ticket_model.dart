class DocRequestTicketModel {
  final String id;
  final String ticketNumber;
  final String? equipmentId;
  final String? equipmentName;
  final String userQuery;
  final String? searchContext;
  final String status;
  final String? assignedToEmail;
  final String? resolutionNotes;
  final DateTime? createdAt;
  final DateTime? resolvedAt;

  const DocRequestTicketModel({
    required this.id,
    required this.ticketNumber,
    this.equipmentId,
    this.equipmentName,
    required this.userQuery,
    this.searchContext,
    required this.status,
    this.assignedToEmail,
    this.resolutionNotes,
    this.createdAt,
    this.resolvedAt,
  });

  factory DocRequestTicketModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val is String) return DateTime.tryParse(val);
      return null;
    }

    return DocRequestTicketModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      ticketNumber: json['ticketNumber']?.toString() ?? 'DOC-PENDING',
      equipmentId: json['equipmentId']?.toString(),
      equipmentName: json['equipmentName']?.toString(),
      userQuery: json['userQuery']?.toString() ?? '',
      searchContext: json['searchContext']?.toString(),
      status: json['status']?.toString() ?? 'open',
      assignedToEmail: json['assignedToEmail']?.toString(),
      resolutionNotes: json['resolutionNotes']?.toString(),
      createdAt: parseDate(json['createdAt']),
      resolvedAt: parseDate(json['resolvedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticketNumber': ticketNumber,
      if (equipmentId != null) 'equipmentId': equipmentId,
      if (equipmentName != null) 'equipmentName': equipmentName,
      'userQuery': userQuery,
      if (searchContext != null) 'searchContext': searchContext,
      'status': status,
      if (assignedToEmail != null) 'assignedToEmail': assignedToEmail,
      if (resolutionNotes != null) 'resolutionNotes': resolutionNotes,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (resolvedAt != null) 'resolvedAt': resolvedAt!.toIso8601String(),
    };
  }
}

