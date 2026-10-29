import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_typography.dart';

/// Section Header with the mandatory 4px primary-color left anchor bar.
/// Signature device of Terminal Cobalt Mobile.
class SectionHeader extends StatelessWidget {
  final String title;
  final Widget? action;
  final EdgeInsetsGeometry padding;

  const SectionHeader({
    super.key,
    required this.title,
    this.action,
    this.padding = const EdgeInsets.symmetric(vertical: 8.0),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 4.0,
            height: 18.0,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(2.0),
            ),
          ),
          const SizedBox(width: 12.0),
          Flexible(
            child: Text(
              title,
              style: AppTypography.headlineMd,
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}

/// The machined primary action button with electric-blue glow halo.
/// The loudest moment on the screen.
class MachinedPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool isDestructive;
  final double height;
  final Key? buttonKey;

  const MachinedPrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isDestructive = false,
    this.height = 56.0,
    this.buttonKey,
  });

  @override
  Widget build(BuildContext context) {
    final baseColor = isDestructive ? AppColors.error : AppColors.primary;
    final glowColor = isDestructive
        ? const Color(0x4DFF3B30) // rgba(255,59,48,0.3)
        : const Color(0x4D0057FF); // rgba(0,87,255,0.3)
    final borderColor = isDestructive
        ? const Color(0x80FF3B30)
        : const Color(0x800057FF);

    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8.0),
        boxShadow: [
          BoxShadow(
            color: glowColor,
            blurRadius: 20.0,
            spreadRadius: 1.0,
          ),
        ],
      ),
      child: ElevatedButton(
        key: buttonKey,
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: baseColor,
          foregroundColor: Colors.white,
          disabledBackgroundColor: baseColor.withValues(alpha: 0.6),
          disabledForegroundColor: Colors.white70,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
            side: BorderSide(color: borderColor, width: 2.0),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 20.0,
                  height: 20.0,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.0,
                    color: Colors.white,
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, size: 20.0, color: Colors.white),
                      const SizedBox(width: 12.0),
                    ],
                    Flexible(
                      child: Text(
                        label,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: AppTypography.headlineMd.copyWith(
                          fontSize: 15.0,
                          letterSpacing: 1.5,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

/// Secondary button: 40px height, surface-alt fill, 1px border.
class SecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final double height;

  const SecondaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.height = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.border, width: 1.0),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8.0),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 16.0, color: AppColors.onSurface),
                  const SizedBox(width: 8.0),
                ],
                Text(
                  label.toUpperCase(),
                  style: AppTypography.labelMd.copyWith(
                    fontSize: 11.5,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 40x40px bordered utility icon button.
class ButtonIconTile extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final Color? iconColor;
  final double size;

  const ButtonIconTile({
    super.key,
    required this.icon,
    this.onPressed,
    this.tooltip,
    this.iconColor,
    this.size = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    Widget button = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.border, width: 1.0),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8.0),
          onTap: onPressed,
          child: Center(
            child: Icon(
              icon,
              size: 18.0,
              color: iconColor ?? AppColors.onSurface,
            ),
          ),
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: button);
    }
    return button;
  }
}

/// Badge Pill for status & telemetry (10% tint bg, 20% border, full color text).
class BadgePill extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;

  const BadgePill({
    super.key,
    required this.label,
    this.color = AppColors.success,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(4.0), // rounded.sm
        border: Border.all(color: color.withValues(alpha: 0.20), width: 1.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11.0, color: color),
            const SizedBox(width: 4.0),
          ],
          Text(
            label,
            style: AppTypography.bodySm.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
              fontSize: 11.0,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

/// 12px filled status dot with 1px white/20% ring border.
class StatusDot extends StatelessWidget {
  final Color color;
  final double size;

  const StatusDot({
    super.key,
    this.color = AppColors.success,
    this.size = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.20),
          width: 1.0,
        ),
      ),
    );
  }
}

/// Square avatar slot (64x64px, 2px primary border, NOT circle).
class SquareAvatar extends StatelessWidget {
  final String? initial;
  final IconData? icon;
  final double size;

  const SquareAvatar({
    super.key,
    this.initial,
    this.icon,
    this.size = 64.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.primary, width: 2.0),
      ),
      child: Center(
        child: icon != null
            ? Icon(icon, color: AppColors.primary, size: size * 0.45)
            : Text(
                (initial != null && initial!.isNotEmpty)
                    ? initial![0].toUpperCase()
                    : 'U',
                style: AppTypography.headlineLg.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
      ),
    );
  }
}

/// Instrument List Row with leading 40x40 tile, identity dot / icon, and trailing light arrow.
class InstrumentListRow extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData? icon;
  final Color? categoricalColor;
  final VoidCallback? onTap;
  final Widget? trailing;

  const InstrumentListRow({
    super.key,
    required this.title,
    required this.subtitle,
    this.icon,
    this.categoricalColor,
    this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.border, width: 1.0),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8.0),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                // Leading 40px square tile
                Container(
                  width: 40.0,
                  height: 40.0,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(6.0),
                    border: Border.all(color: AppColors.border, width: 1.0),
                  ),
                  child: Center(
                    child: categoricalColor != null
                        ? Container(
                            width: 10.0,
                            height: 10.0,
                            decoration: BoxDecoration(
                              color: categoricalColor,
                              shape: BoxShape.circle,
                            ),
                          )
                        : Icon(
                            icon ?? Icons.tune_rounded,
                            size: 18.0,
                            color: AppColors.onSurface,
                          ),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTypography.bodyMd.copyWith(fontSize: 13.5),
                      ),
                      const SizedBox(height: 2.0),
                      Text(
                        subtitle.toUpperCase(),
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                ),
                trailing ??
                    const Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 14.0,
                      color: AppColors.onSurfaceVariant,
                    ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
