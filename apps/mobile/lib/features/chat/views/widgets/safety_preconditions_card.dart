import 'package:flutter/material.dart';
import '../../models/safety_preconditions_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/widgets/terminal_components.dart';

/// Terminal Cobalt Mobile Safety Preconditions Card
/// Pinned above diagnostic steps to enforce zero-energy isolation and PPE compliance.
class SafetyPreconditionsCard extends StatefulWidget {
  final SafetyPreconditionsModel preconditions;

  const SafetyPreconditionsCard({
    super.key,
    required this.preconditions,
  });

  @override
  State<SafetyPreconditionsCard> createState() => _SafetyPreconditionsCardState();
}

class _SafetyPreconditionsCardState extends State<SafetyPreconditionsCard> {
  final Set<int> _checkedLotoSteps = {};
  bool _isExpanded = true;

  IconData _getPpeIcon(String tag) {
    final lower = tag.toLowerCase();
    if (lower.contains('glass') || lower.contains('goggle') || lower.contains('eye')) {
      return Icons.visibility_rounded;
    }
    if (lower.contains('glove') || lower.contains('hand')) {
      return Icons.pan_tool_rounded;
    }
    if (lower.contains('boot') || lower.contains('shoe') || lower.contains('toe')) {
      return Icons.sports_volleyball_rounded;
    }
    if (lower.contains('respirator') || lower.contains('mask')) {
      return Icons.masks_rounded;
    }
    if (lower.contains('ear') || lower.contains('hearing')) {
      return Icons.hearing_rounded;
    }
    if (lower.contains('shield') || lower.contains('face')) {
      return Icons.face_rounded;
    }
    if (lower.contains('hat') || lower.contains('helmet')) {
      return Icons.engineering_rounded;
    }
    return Icons.shield_rounded;
  }

  String _formatPpeLabel(String tag) {
    return tag.replaceAll('_', ' ');
  }

  @override
  Widget build(BuildContext context) {
    final pre = widget.preconditions;
    if (pre.isEmpty) return const SizedBox.shrink();

    final isAllLotoChecked =
        pre.lotoSteps.isEmpty || _checkedLotoSteps.length == pre.lotoSteps.length;

    return Container(
      margin: const EdgeInsets.only(bottom: 14.0),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: isAllLotoChecked ? AppColors.border : AppColors.warning,
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header banner with 4px left warning bar
          InkWell(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8.0)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
              decoration: const BoxDecoration(
                color: AppColors.surfaceMuted,
                borderRadius: BorderRadius.vertical(top: Radius.circular(8.0)),
                border: Border(bottom: BorderSide(color: AppColors.border, width: 1.0)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 4.0,
                    height: 18.0,
                    decoration: BoxDecoration(
                      color: AppColors.warning,
                      borderRadius: BorderRadius.circular(2.0),
                    ),
                  ),
                  const SizedBox(width: 10.0),
                  Expanded(
                    child: Text(
                      'SAFETY PRECONDITIONS PINNED FIRST',
                      style: AppTypography.headlineMd.copyWith(
                        fontSize: 13.0,
                        letterSpacing: 0.8,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ),
                  Icon(
                    _isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                    color: AppColors.onSurfaceVariant,
                    size: 20.0,
                  ),
                ],
              ),
            ),
          ),

          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Overdue Document Alert Banner
                  if (pre.isOverdueWarning != null && pre.isOverdueWarning!.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(10.0),
                      margin: const EdgeInsets.only(bottom: 12.0),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(4.0),
                        border: Border.all(
                          color: AppColors.error.withValues(alpha: 0.20),
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(
                            Icons.error_outline_rounded,
                            color: AppColors.error,
                            size: 16.0,
                          ),
                          const SizedBox(width: 8.0),
                          Expanded(
                            child: Text(
                              pre.isOverdueWarning!.toUpperCase(),
                              style: AppTypography.caption.copyWith(
                                color: AppColors.error,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // 2. Required PPE Chips
                  if (pre.ppeRequired.isNotEmpty) ...[
                    Row(
                      children: [
                        const StatusDot(
                          color: AppColors.accentCategorical2,
                          size: 8.0,
                        ),
                        const SizedBox(width: 8.0),
                        Text(
                          'MANDATORY PPE BEFORE TOUCHING EQUIPMENT',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.onSurfaceVariant,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8.0),
                    Wrap(
                      spacing: 8.0,
                      runSpacing: 8.0,
                      children: pre.ppeRequired.map((tag) {
                        return BadgePill(
                          label: _formatPpeLabel(tag),
                          color: AppColors.accentCategorical2,
                          icon: _getPpeIcon(tag),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14.0),
                  ],

                  // 3. Hazard Warnings
                  if (pre.warnings.isNotEmpty) ...[
                    Row(
                      children: [
                        const StatusDot(
                          color: AppColors.warning,
                          size: 8.0,
                        ),
                        const SizedBox(width: 8.0),
                        Text(
                          'HAZARD WARNINGS & ISOLATION DIRECTIVES',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.onSurfaceVariant,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6.0),
                    ...pre.warnings.map((w) => Padding(
                          padding: const EdgeInsets.only(bottom: 6.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 2.0, right: 6.0),
                                child: Icon(
                                  Icons.arrow_right_rounded,
                                  color: AppColors.warning,
                                  size: 16.0,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  w,
                                  style: AppTypography.bodySm.copyWith(
                                    color: AppColors.onSurface,
                                    height: 1.35,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(height: 12.0),
                  ],

                  // 4. Interactive LOTO Verification Checklist
                  if (pre.lotoSteps.isNotEmpty) ...[
                    Row(
                      children: [
                        const StatusDot(
                          color: AppColors.success,
                          size: 8.0,
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Text(
                            'LOCKOUT / TAGOUT (LOTO) VERIFICATION',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.onSurfaceVariant,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        BadgePill(
                          label:
                              '${_checkedLotoSteps.length}/${pre.lotoSteps.length} VERIFIED',
                          color: isAllLotoChecked
                              ? AppColors.success
                              : AppColors.warning,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8.0),
                    ...List.generate(pre.lotoSteps.length, (idx) {
                      final stepText = pre.lotoSteps[idx];
                      final isChecked = _checkedLotoSteps.contains(idx);

                      return InkWell(
                        key: Key('loto_step_checkbox_$idx'),
                        onTap: () {
                          setState(() {
                            if (isChecked) {
                              _checkedLotoSteps.remove(idx);
                            } else {
                              _checkedLotoSteps.add(idx);
                            }
                          });
                        },
                        borderRadius: BorderRadius.circular(4.0),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                isChecked
                                    ? Icons.check_box
                                    : Icons.check_box_outline_blank,
                                size: 20.0,
                                color: isChecked
                                    ? AppColors.primary
                                    : AppColors.onSurfaceVariant,
                              ),
                              const SizedBox(width: 8.0),
                              Expanded(
                                child: Text(
                                  stepText,
                                  style: AppTypography.bodySm.copyWith(
                                    color: isChecked
                                        ? AppColors.onSurfaceVariant
                                        : AppColors.onSurface,
                                    decoration: isChecked
                                        ? TextDecoration.lineThrough
                                        : null,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}
