import 'citation_model.dart';
import 'safety_preconditions_model.dart';

class ChatResponseModel {
  final String answer;
  final List<CitationModel> citations;
  final String warningLevel;
  final double? confidenceScore;
  final String? provider;
  final SafetyPreconditionsModel? safetyPreconditions;
  final SuggestedTicketModel? suggestedTicket;
  final List<String> expandedTerms;

  const ChatResponseModel({
    required this.answer,
    this.citations = const [],
    this.warningLevel = 'none',
    this.confidenceScore,
    this.provider,
    this.safetyPreconditions,
    this.suggestedTicket,
    this.expandedTerms = const [],
  });

  factory ChatResponseModel.fromJson(Map<String, dynamic> json) {
    List<CitationModel> parsedCitations = [];
    if (json['citations'] is List) {
      parsedCitations = (json['citations'] as List)
          .whereType<Map<String, dynamic>>()
          .map((c) => CitationModel.fromJson(c))
          .toList();
    }

    SafetyPreconditionsModel? safety;
    if (json['safetyPreconditions'] is Map) {
      safety = SafetyPreconditionsModel.fromJson(
        Map<String, dynamic>.from(json['safetyPreconditions'] as Map),
      );
    }

    SuggestedTicketModel? ticket;
    if (json['suggestedTicket'] is Map) {
      ticket = SuggestedTicketModel.fromJson(
        Map<String, dynamic>.from(json['suggestedTicket'] as Map),
      );
    }

    List<String> terms = [];
    if (json['expandedTerms'] is List) {
      terms = (json['expandedTerms'] as List).map((e) => e.toString()).toList();
    }

    return ChatResponseModel(
      answer: json['answer']?.toString() ?? '',
      citations: parsedCitations,
      warningLevel: json['warningLevel']?.toString() ?? 'none',
      confidenceScore: (json['confidenceScore'] is num)
          ? (json['confidenceScore'] as num).toDouble()
          : null,
      provider: json['provider'] as String?,
      safetyPreconditions: safety,
      suggestedTicket: ticket,
      expandedTerms: terms,
    );
  }
}
