import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/widgets/terminal_components.dart';
import '../../../documents/views/widgets/authenticated_figure_viewer.dart';
import '../../../diagram/views/interactive_diagram_viewer_screen.dart';
import '../../models/citation_model.dart';

/// Terminal Cobalt Mobile Citation Card
/// Instrumented manual passage with document title, revision, page, and diagram triggers.
class CitationCard extends StatefulWidget {
  final CitationModel citation;
  final int index;
  final void Function(String prompt)? onAskAboutPart;
  final void Function(String prompt)? onAskAboutFigure;

  const CitationCard({
    super.key,
    required this.citation,
    this.index = 0,
    this.onAskAboutPart,
    this.onAskAboutFigure,
  });

  @override
  State<CitationCard> createState() => _CitationCardState();
}

class _CitationCardState extends State<CitationCard> {
  bool _isExpanded = false;

  void _openInteractiveDiagram(String figureId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InteractiveDiagramViewerScreen(
          figureId: figureId,
          title: '${widget.citation.documentTitle} (Page ${widget.citation.page})',
          onAskAboutPart: widget.onAskAboutPart ?? widget.onAskAboutFigure,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.citation;
    final isExplodedDiagram = c.figures.isNotEmpty ||
        c.documentTitle.toLowerCase().contains('pump') ||
        c.documentTitle.toLowerCase().contains('exploded') ||
        c.documentTitle.toLowerCase().contains('rebuild');

    return Container(
      margin: const EdgeInsets.only(top: 8.0),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(8.0), // rounded.lg
        border: Border.all(
          color: c.isOverdue == true ? AppColors.error : AppColors.border,
          width: 1.0,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8.0),
          onTap: () {
            setState(() {
              _isExpanded = !_isExpanded;
            });
          },
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(4.0),
                        border: Border.all(color: AppColors.border, width: 1.0),
                      ),
                      child: Text(
                        '[${widget.index + 1}]',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            c.documentTitle,
                            style: AppTypography.bodyMd.copyWith(
                              fontSize: 12.5,
                              color: AppColors.onSurface,
                            ),
                            maxLines: _isExpanded ? null : 1,
                            overflow: _isExpanded ? null : TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3.0),
                          Wrap(
                            spacing: 8.0,
                            children: [
                              Text(
                                'PAGE ${c.page} // ${c.revision.toUpperCase()}',
                                style: AppTypography.caption,
                              ),
                              if (c.section != null && c.section!.isNotEmpty)
                                Text(
                                  c.section!.toUpperCase(),
                                  style: AppTypography.caption,
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      _isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                      size: 18.0,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ],
                ),

                // Overdue warning tag
                if (c.isOverdue == true) ...[
                  const SizedBox(height: 8.0),
                  BadgePill(
                    label: 'DOCUMENT OVERDUE FOR ANNUAL SAFETY REVIEW (${c.reviewDate ?? "OVERDUE"})',
                    color: AppColors.error,
                    icon: Icons.error_outline_rounded,
                  ),
                ],

                // Excerpt & Figures when expanded
                if (_isExpanded) ...[
                  const SizedBox(height: 10.0),
                  const Divider(color: AppColors.border, height: 1.0),
                  const SizedBox(height: 10.0),
                  Text(
                    'VERIFIED MANUAL EXCERPT:',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.onSurfaceVariant,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    c.excerpt,
                    style: AppTypography.bodySm.copyWith(
                      color: AppColors.onSurface,
                      height: 1.4,
                    ),
                  ),

                  // Exploded view diagram trigger
                  if (isExplodedDiagram) ...[
                    const SizedBox(height: 12.0),
                    SecondaryButton(
                      label: 'TAP-THE-PART: EXPLODED VIEW',
                      icon: Icons.schema_rounded,
                      onPressed: () {
                        _openInteractiveDiagram('FIG-P102-EXPLODED');
                      },
                    ),
                  ],

                  // Inline Figures
                  if (c.figures.isNotEmpty) ...[
                    const SizedBox(height: 12.0),
                    ...c.figures.map((fig) => Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: AuthenticatedFigureViewer(
                            documentId: c.documentId,
                            figureId: fig,
                            documentTitle: c.documentTitle,
                            page: c.page,
                          ),
                        )),
                  ],
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
