import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/widgets/terminal_components.dart';
import '../../models/chat_message_model.dart';
import '../../../tickets/repositories/ticket_repository.dart';
import 'citation_card.dart';
import 'safety_preconditions_card.dart';

/// Terminal Cobalt Mobile Chat Bubble
/// Industrial. Instrumented. Operational.
class ChatBubble extends ConsumerStatefulWidget {
  final ChatMessageModel message;
  final void Function(String prompt)? onSendMessage;

  const ChatBubble({
    super.key,
    required this.message,
    this.onSendMessage,
  });

  @override
  ConsumerState<ChatBubble> createState() => _ChatBubbleState();
}

class _ChatBubbleState extends ConsumerState<ChatBubble> {
  bool _showCitations = false;
  bool _isTicketSubmitting = false;
  bool _isTicketSubmitted = false;

  void _copyToClipboard(BuildContext context) {
    Clipboard.setData(ClipboardData(text: widget.message.content));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'ANSWER COPIED TO CLIPBOARD',
          style: AppTypography.caption.copyWith(color: Colors.white),
        ),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.surfaceAlt,
      ),
    );
  }

  Future<void> _handleRequestDocumentation() async {
    final ticketInfo = widget.message.suggestedTicket;
    if (ticketInfo == null || _isTicketSubmitted) return;

    setState(() => _isTicketSubmitting = true);

    try {
      final repo = ref.read(ticketRepositoryProvider);
      final ticket = await repo.createTicket(
        userQuery: ticketInfo.query,
        equipmentId: ticketInfo.equipmentId,
        searchContext: ticketInfo.reason,
      );

      if (mounted) {
        setState(() {
          _isTicketSubmitting = false;
          _isTicketSubmitted = true;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'DOCUMENTATION TICKET ${ticket.ticketNumber} CREATED // PLANT ENGINEERING NOTIFIED',
              style: AppTypography.caption.copyWith(color: AppColors.success),
            ),
            backgroundColor: AppColors.surfaceAlt,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isTicketSubmitting = false);
      }
    }
  }

  Widget _buildWarningLevelBanner(String level) {
    Color barColor;
    String label;

    switch (level.toLowerCase()) {
      case 'critical':
        barColor = AppColors.error;
        label = 'CRITICAL INDUSTRIAL SAFETY DIRECTIVE';
        break;
      case 'warning':
        barColor = AppColors.warning;
        label = 'OPERATIONAL SAFETY WARNING';
        break;
      case 'caution':
        barColor = AppColors.warning;
        label = 'SAFETY CAUTION ADVISORY';
        break;
      default:
        return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: barColor.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(4.0),
        border: Border.all(color: barColor.withValues(alpha: 0.20), width: 1.0),
      ),
      child: Row(
        children: [
          Container(
            width: 4.0,
            height: 16.0,
            decoration: BoxDecoration(
              color: barColor,
              borderRadius: BorderRadius.circular(2.0),
            ),
          ),
          const SizedBox(width: 8.0),
          Expanded(
            child: Text(
              label,
              style: AppTypography.caption.copyWith(
                color: barColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isUser = widget.message.isUser;
    final citations = widget.message.citations;
    final confidence = widget.message.confidenceScore;
    final warningLevel = widget.message.warningLevel;
    final safetyPreconditions = widget.message.safetyPreconditions;
    final ticketInfo = widget.message.suggestedTicket;
    final hasTicketSuggestion = ticketInfo != null;
    final expandedTerms = widget.message.expandedTerms;

    if (isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(top: 8.0, bottom: 8.0, left: 48.0),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          decoration: BoxDecoration(
            color: AppColors.surfaceAlt,
            borderRadius: BorderRadius.circular(8.0), // rounded.lg
            border: Border.all(color: AppColors.border, width: 1.0),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Flexible(
                child: Text(
                  widget.message.content,
                  style: AppTypography.bodyMd.copyWith(
                    fontWeight: FontWeight.w400,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 10.0),
              Container(
                width: 3.0,
                height: 16.0,
                margin: const EdgeInsets.only(top: 2.0),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(1.5),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Assistant Message Layout
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(top: 8.0, bottom: 12.0, right: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Copilot Header Telemetry
            Row(
              children: [
                const StatusDot(color: AppColors.success, size: 10.0),
                const SizedBox(width: 8.0),
                Text(
                  'MAN-U-AI Copilot',
                  style: AppTypography.labelMd.copyWith(
                    fontSize: 11.5,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(width: 8.0),
                if (confidence != null && confidence > 0)
                  BadgePill(
                    label: widget.message.isOfflineFallback
                        ? 'OFFLINE RETRIEVAL'
                        : '${(confidence * 100).toInt()}% Grounded',
                    color: widget.message.isOfflineFallback
                        ? AppColors.warning
                        : AppColors.primary,
                  ),
                const Spacer(),
                ButtonIconTile(
                  key: const Key('copy_answer_button'),
                  icon: Icons.copy_rounded,
                  size: 32.0,
                  tooltip: 'Copy Answer',
                  onPressed: () => _copyToClipboard(context),
                ),
              ],
            ),
            const SizedBox(height: 8.0),

            // Pinned Safety Preconditions Card (Pinned First)
            if (safetyPreconditions != null && safetyPreconditions.isNotEmpty)
              SafetyPreconditionsCard(preconditions: safetyPreconditions),

            // Plant Glossary Query Expansion indicator
            if (expandedTerms.isNotEmpty) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 8.0),
                padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 6.0),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(4.0),
                  border: Border.all(color: AppColors.border, width: 1.0),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8.0,
                      height: 8.0,
                      decoration: const BoxDecoration(
                        color: AppColors.accentCategorical5, // Cyan
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        'PLANT GLOSSARY EXPANDED: ${expandedTerms.join(" • ")}'.toUpperCase(),
                        style: AppTypography.caption.copyWith(
                          color: AppColors.accentCategorical5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Message Body Card
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(8.0), // rounded.lg
                border: Border.all(color: AppColors.border, width: 1.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (warningLevel != null && warningLevel != 'none')
                    _buildWarningLevelBanner(warningLevel),

                  MarkdownBody(
                    data: widget.message.content,
                    selectable: true,
                    styleSheet: MarkdownStyleSheet(
                      p: AppTypography.bodyMdRegular.copyWith(
                        color: AppColors.onSurface,
                        fontSize: 13.5,
                        height: 1.5,
                      ),
                      code: AppTypography.bodySm.copyWith(
                        color: AppColors.primary,
                        backgroundColor: AppColors.surfaceMuted,
                      ),
                      codeblockDecoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(4.0),
                        border: Border.all(color: AppColors.border, width: 1.0),
                      ),
                      strong: AppTypography.bodyMd.copyWith(
                        color: AppColors.onSurface,
                        fontWeight: FontWeight.w700,
                      ),
                      h1: AppTypography.headlineLg.copyWith(fontSize: 18.0),
                      h2: AppTypography.headlineMd.copyWith(fontSize: 16.0),
                      h3: AppTypography.headlineMd.copyWith(fontSize: 14.0),
                      listBullet: AppTypography.bodyMd.copyWith(color: AppColors.primary),
                    ),
                  ),

                  // Refusal-to-Fix Loop Card (One-Tap Request Documentation)
                  if (hasTicketSuggestion) ...[
                    const SizedBox(height: 16.0),
                    Container(
                      padding: const EdgeInsets.all(12.0),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(6.0),
                        border: Border.all(color: AppColors.border, width: 1.0),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 4.0,
                                height: 16.0,
                                decoration: BoxDecoration(
                                  color: AppColors.warning,
                                  borderRadius: BorderRadius.circular(2.0),
                                ),
                              ),
                              const SizedBox(width: 8.0),
                              Expanded(
                                child: Text(
                                  'DOCUMENTATION GAP DETECTED',
                                  style: AppTypography.labelMd.copyWith(
                                    color: AppColors.warning,
                                    fontSize: 11.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6.0),
                          Text(
                            ticketInfo.reason,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 12.0),
                          _isTicketSubmitted
                              ? Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10.0, vertical: 6.0),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withValues(alpha: 0.10),
                                    borderRadius: BorderRadius.circular(4.0),
                                    border: Border.all(
                                      color: AppColors.success.withValues(alpha: 0.20),
                                      width: 1.0,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.check_rounded,
                                        size: 14.0,
                                        color: AppColors.success,
                                      ),
                                      const SizedBox(width: 6.0),
                                      Text(
                                        'DOCUMENTATION REQUEST LOGGED',
                                        style: AppTypography.caption.copyWith(
                                          color: AppColors.success,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : MachinedPrimaryButton(
                                  buttonKey: const Key('request_documentation_button'),
                                  label: 'Request Documentation From Owner',
                                  isLoading: _isTicketSubmitting,
                                  icon: Icons.assignment_late_rounded,
                                  height: 44.0,
                                  onPressed: _handleRequestDocumentation,
                                ),
                        ],
                      ),
                    ),
                  ],

                  // Citations Drawer Section
                  if (citations.isNotEmpty) ...[
                    const SizedBox(height: 12.0),
                    const Divider(color: AppColors.border, height: 1.0),
                    const SizedBox(height: 8.0),
                    InkWell(
                      key: const Key('toggle_citations_button'),
                      onTap: () => setState(() => _showCitations = !_showCitations),
                      borderRadius: BorderRadius.circular(6.0),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          children: [
                            BadgePill(
                              label: '${citations.length} VERIFIED CITATIONS',
                              color: AppColors.accentCategorical2,
                              icon: Icons.menu_book_rounded,
                            ),
                            const Spacer(),
                            Icon(
                              _showCitations
                                  ? Icons.expand_less_rounded
                                  : Icons.expand_more_rounded,
                              size: 18.0,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (_showCitations) ...[
                      const SizedBox(height: 8.0),
                      ...citations.asMap().entries.map((entry) => CitationCard(
                            key: Key('citation_card_${entry.key}'),
                            citation: entry.value,
                            onAskAboutFigure: widget.onSendMessage,
                          )),
                    ],
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
