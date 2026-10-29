import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Terminal Cobalt Mobile Typography
/// Headings: Space Grotesk (Humanist geometric sans)
/// Body, readouts, labels, numbers: JetBrains Mono (Code-grade monospace)
class AppTypography {
  AppTypography._();

  // Headings — Space Grotesk
  static TextStyle get displayLg => GoogleFonts.spaceGrotesk(
        fontSize: 48.0,
        fontWeight: FontWeight.w700,
        height: 52 / 48,
        letterSpacing: -0.02 * 48,
        color: AppColors.onSurface,
      );

  static TextStyle get headlineLg => GoogleFonts.spaceGrotesk(
        fontSize: 20.0,
        fontWeight: FontWeight.w700,
        height: 26 / 20,
        letterSpacing: -0.01 * 20,
        color: AppColors.onSurface,
      );

  /// Load-bearing section header anchor style (always uppercase)
  static TextStyle get headlineMd => GoogleFonts.spaceGrotesk(
        fontSize: 18.0,
        fontWeight: FontWeight.w700,
        height: 24 / 18,
        letterSpacing: 0.02 * 18,
        color: AppColors.onSurface,
      );

  // Body & Telemetry — JetBrains Mono
  static TextStyle get bodyMd => GoogleFonts.jetBrainsMono(
        fontSize: 14.0,
        fontWeight: FontWeight.w700,
        height: 20 / 14,
        letterSpacing: 0.0,
        color: AppColors.onSurface,
      );

  static TextStyle get bodyMdRegular => GoogleFonts.jetBrainsMono(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
        height: 20 / 14,
        letterSpacing: 0.0,
        color: AppColors.onSurfaceVariant,
      );

  static TextStyle get bodySm => GoogleFonts.jetBrainsMono(
        fontSize: 12.0,
        fontWeight: FontWeight.w400,
        height: 16 / 12,
        letterSpacing: 0.0,
        color: AppColors.onSurfaceVariant,
      );

  static TextStyle get labelMd => GoogleFonts.jetBrainsMono(
        fontSize: 12.0,
        fontWeight: FontWeight.w700,
        height: 14 / 12,
        letterSpacing: 1.8,
        color: AppColors.onSurface,
      );

  /// Workhorse of secondary information: status pills, row metadata, titles
  static TextStyle get labelUppercase => GoogleFonts.jetBrainsMono(
        fontSize: 12.0,
        fontWeight: FontWeight.w400,
        height: 14 / 12,
        letterSpacing: 2.16,
        color: AppColors.onSurfaceVariant,
      );

  static TextStyle get caption => GoogleFonts.jetBrainsMono(
        fontSize: 10.0,
        fontWeight: FontWeight.w400,
        height: 12 / 10,
        letterSpacing: 1.8,
        color: AppColors.onSurfaceVariant,
      );

  static TextStyle get numericMd => GoogleFonts.jetBrainsMono(
        fontSize: 16.0,
        fontWeight: FontWeight.w700,
        height: 20 / 16,
        letterSpacing: 0.0,
        color: AppColors.onSurface,
      );
}
