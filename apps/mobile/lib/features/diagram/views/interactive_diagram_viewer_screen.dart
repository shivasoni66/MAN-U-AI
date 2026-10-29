import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/diagram_annotation_model.dart';
import '../repositories/diagram_repository.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/widgets/terminal_components.dart';

/// Terminal Cobalt Mobile Interactive Diagram Viewer Screen
/// Multimodal Exploded-View Diagram with interactive part hotspots.
class InteractiveDiagramViewerScreen extends ConsumerStatefulWidget {
  final String figureId;
  final String? title;
  final void Function(String prompt)? onAskAboutPart;

  const InteractiveDiagramViewerScreen({
    super.key,
    required this.figureId,
    this.title,
    this.onAskAboutPart,
  });

  @override
  ConsumerState<InteractiveDiagramViewerScreen> createState() =>
      _InteractiveDiagramViewerScreenState();
}

class _InteractiveDiagramViewerScreenState
    extends ConsumerState<InteractiveDiagramViewerScreen> {
  DiagramAnnotationModel? _annotation;
  bool _isLoading = true;
  DiagramHotspotModel? _selectedHotspot;

  @override
  void initState() {
    super.initState();
    _loadAnnotations();
  }

  Future<void> _loadAnnotations() async {
    final repo = ref.read(diagramRepositoryProvider);
    final data = await repo.getAnnotations(widget.figureId);
    if (mounted) {
      setState(() {
        _annotation = data;
        _isLoading = false;
      });
    }
  }

  void _showPartDetailsSheet(DiagramHotspotModel spot) {
    setState(() => _selectedHotspot = spot);

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceAlt,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8.0)), // rounded.lg
        side: BorderSide(color: AppColors.border, width: 1.0),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  BadgePill(
                    label: 'PART // ${spot.partNumber}',
                    color: AppColors.primary,
                  ),
                  const Spacer(),
                  if (spot.manualPage != null)
                    Text(
                      'MANUAL PAGE ${spot.manualPage}',
                      style: AppTypography.caption,
                    ),
                ],
              ),
              const SizedBox(height: 14.0),
              SectionHeader(
                title: spot.partName,
                padding: EdgeInsets.zero,
              ),
              if (spot.description != null && spot.description!.isNotEmpty) ...[
                const SizedBox(height: 10.0),
                Text(
                  spot.description!.toUpperCase(),
                  style: AppTypography.bodySm.copyWith(
                    color: AppColors.onSurface,
                    height: 1.4,
                  ),
                ),
              ],
              const SizedBox(height: 20.0),
              MachinedPrimaryButton(
                label: 'ASK COPILOT ABOUT THIS PART',
                icon: Icons.psychology_rounded,
                onPressed: () {
                  Navigator.pop(ctx); // Close sheet
                  final prompt =
                      'What are the removal procedure, inspection checks, and torque ratings for Part ${spot.partNumber} (${spot.partName})?';
                  if (widget.onAskAboutPart != null) {
                    widget.onAskAboutPart!(prompt);
                    Navigator.pop(context); // Close viewer
                  }
                },
              ),
              const SizedBox(height: 10.0),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: Center(
          child: ButtonIconTile(
            icon: Icons.arrow_back_ios_new_rounded,
            size: 36.0,
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        title: Row(
          children: [
            const StatusDot(color: AppColors.primary, size: 8.0),
            const SizedBox(width: 8.0),
            Expanded(
              child: Text(
                widget.title ?? _annotation?.title ?? 'Exploded Assembly Diagram',
                style: AppTypography.headlineMd.copyWith(fontSize: 13.5),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          ButtonIconTile(
            icon: Icons.auto_awesome,
            tooltip: 'Run AI Vision Part Detection',
            iconColor: AppColors.primary,
            size: 36.0,
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              setState(() => _isLoading = true);
              final repo = ref.read(diagramRepositoryProvider);
              final refreshed = await repo.annotateWithVision(widget.figureId);
              if (mounted) {
                setState(() {
                  _annotation = refreshed;
                  _isLoading = false;
                });
                messenger.showSnackBar(
                  SnackBar(
                    content: Text(
                      'EXPLODED VIEW VERIFIED VIA MULTIMODAL VISION'
                          .toUpperCase(),
                      style: AppTypography.caption.copyWith(color: AppColors.success),
                    ),
                    backgroundColor: AppColors.surfaceAlt,
                  ),
                );
              }
            },
          ),
          const SizedBox(width: 12.0),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: SizedBox(
                width: 24.0,
                height: 24.0,
                child: CircularProgressIndicator(strokeWidth: 2.0),
              ),
            )
          : Column(
              children: [
                const Divider(color: AppColors.border, height: 1.0),

                // Top Instructional Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  color: AppColors.surfaceAlt,
                  child: Row(
                    children: [
                      const Icon(Icons.touch_app_rounded, size: 14.0, color: AppColors.primary),
                      const SizedBox(width: 8.0),
                      Text(
                        'Tap any numbered part callout for OEM specifications',
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                ),

                // Interactive Diagram Canvas
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(8.0), // rounded.lg
                        border: Border.all(color: AppColors.border, width: 1.0),
                      ),
                      child: InteractiveViewer(
                        maxScale: 4.0,
                        minScale: 0.8,
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                          final canvasWidth = constraints.maxWidth;
                          final canvasHeight = constraints.maxHeight;

                          return Stack(
                            children: [
                              // Diagram Outline
                              Center(
                                child: CustomPaint(
                                  size: Size(canvasWidth * 0.9, canvasHeight * 0.8),
                                  painter: _PumpSchematicPainter(),
                                ),
                              ),

                              // Hotspot Pins
                              if (_annotation != null)
                                ..._annotation!.hotspots.map((spot) {
                                  final isSelected = _selectedHotspot?.id == spot.id;
                                  final xNorm = spot.boundingBox.length >= 4
                                      ? (spot.boundingBox[1] + spot.boundingBox[3]) / 2000.0
                                      : 0.5;
                                  final yNorm = spot.boundingBox.length >= 4
                                      ? (spot.boundingBox[0] + spot.boundingBox[2]) / 2000.0
                                      : 0.5;
                                  final left = (xNorm * canvasWidth) - 18.0;
                                  final top = (yNorm * canvasHeight) - 18.0;

                                  return Positioned(
                                    left: left,
                                    top: top,
                                    child: GestureDetector(
                                      onTap: () => _showPartDetailsSheet(spot),
                                      child: AnimatedContainer(
                                        duration: const Duration(milliseconds: 200),
                                        width: 36.0,
                                        height: 36.0,
                                        decoration: BoxDecoration(
                                          color: isSelected
                                              ? AppColors.primary
                                              : AppColors.surface,
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: isSelected
                                                ? Colors.white
                                                : AppColors.primary,
                                            width: 2.0,
                                          ),
                                          boxShadow: const [
                                            BoxShadow(
                                              color: Color(0x660057FF), // rgba(0,87,255,0.4)
                                              blurRadius: 15.0,
                                              spreadRadius: 1.0,
                                            ),
                                          ],
                                        ),
                                        child: Center(
                                          child: Text(
                                            spot.partNumber,
                                            style: AppTypography.caption.copyWith(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w700,
                                              fontSize: 10.5,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                ),
                ),
              ],
            ),
    );
  }
}

/// Custom painter for exploded pump schematic wireframe.
class _PumpSchematicPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final dashPaint = Paint()
      ..color = AppColors.onSurfaceVariant.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Pump Housing Outline
    final center = Offset(size.width * 0.5, size.height * 0.5);
    canvas.drawCircle(center, size.width * 0.35, paint);
    canvas.drawCircle(center, size.width * 0.22, paint);

    // Drive Shaft Centerline
    canvas.drawLine(
      Offset(size.width * 0.1, size.height * 0.5),
      Offset(size.width * 0.9, size.height * 0.5),
      dashPaint,
    );

    // Impeller Vanes
    for (int i = 0; i < 4; i++) {
      final rect = Rect.fromCenter(
        center: center,
        width: size.width * (0.15 + (i * 0.08)),
        height: size.height * 0.12,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(4.0)),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
