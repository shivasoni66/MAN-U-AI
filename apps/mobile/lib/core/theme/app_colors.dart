import 'package:flutter/material.dart';

/// Terminal Cobalt Mobile design system color tokens.
/// Industrial. Instrumented. Operational.
class AppColors {
  AppColors._();

  // Core Brand & Palette
  static const Color primary = Color(0xFF0057FF); // Saturated electric blue
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color primaryHover = Color(0xFF2670FF);
  static const Color primaryFocus = Color(0xFF0057FF);
  static const Color primaryMuted = Color(0xFF003BB3);
  static const Color primarySubtle = Color(0xFF0D2566);

  // Surfaces (Near-black canvas with 3 tonal layers)
  static const Color surface = Color(0xFF121212); // Page canvas
  static const Color surfaceAlt = Color(0xFF1E1E1E); // Cards, rows, dialogs
  static const Color surfaceMuted = Color(0xFF2C2C2C); // Inputs, recessed wells

  // Foreground Text / Content
  static const Color onSurface = Color(0xFFFFFFFF); // Primary content / numbers
  static const Color onSurfaceVariant = Color(0xFFA3A3A3); // Metadata, captions, secondary

  // Borders & Hairlines
  static const Color border = Color(0xFF333333); // 1px hairlines on every surface

  // Semantic Feedback (Tinted pill badge recipes)
  static const Color success = Color(0xFF4ADE80); // Minty terminal green
  static const Color error = Color(0xFFFF3B30); // Terminal red
  static const Color danger = Color(0xFFFF3B30); // Danger alias
  static const Color warning = Color(0xFFFACC15); // Categorical yellow / amber warning
  static const Color info = Color(0xFF60A5FA);

  // Categorical Identity Dots (8-12px identity dots only, never for chrome)
  static const Color accentCategorical1 = Color(0xFFFB923C); // Orange
  static const Color accentCategorical2 = Color(0xFF60A5FA); // Blue
  static const Color accentCategorical3 = Color(0xFF2DD4BF); // Teal
  static const Color accentCategorical4 = Color(0xFFC084FC); // Purple
  static const Color accentCategorical5 = Color(0xFF22D3EE); // Cyan
  static const Color accentCategorical6 = Color(0xFFF472B6); // Pink
  static const Color accentCategorical7 = Color(0xFFF87171); // Red
  static const Color accentCategorical8 = Color(0xFFFACC15); // Yellow

  // Backward-compatibility aliases for existing codebase references
  static const Color canvas = surface;
  static const Color surface1 = surfaceAlt;
  static const Color surface2 = surfaceMuted;
  static const Color surface3 = surfaceMuted;
  static const Color surface4 = Color(0xFF343434);
  static const Color hairline = border;
  static const Color hairlineStrong = Color(0xFF444444);
  static const Color hairlineTertiary = Color(0xFF555555);
  static const Color ink = onSurface;
  static const Color inkMuted = onSurface;
  static const Color inkSubtle = onSurfaceVariant;
  static const Color inkTertiary = onSurfaceVariant;
  static const Color brandSecure = primary;
}
