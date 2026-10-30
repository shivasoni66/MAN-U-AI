import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/widgets/terminal_components.dart';

/// Terminal Cobalt Mobile Plant Glossary & Slang Modal
class PlantGlossaryModal extends StatefulWidget {
  final void Function(String term)? onSelectTerm;

  const PlantGlossaryModal({
    super.key,
    this.onSelectTerm,
  });

  @override
  State<PlantGlossaryModal> createState() => _PlantGlossaryModalState();
}

class _PlantGlossaryModalState extends State<PlantGlossaryModal> {
  String _searchQuery = '';

  static const List<Map<String, dynamic>> _glossaryItems = [
    {
      'term': 'the blower',
      'canonical': 'Induced Draft Centrifugal Fan',
      'tag': 'IDF-400',
      'category': 'slang',
      'synonyms': ['draft fan', 'exhaust blower', 'IDF-400 fan'],
      'area': 'Boiler House',
    },
    {
      'term': 'pack pump',
      'canonical': 'High Pressure Slurry Recirculation Pump',
      'tag': 'P-102',
      'category': 'equipment_tag',
      'synonyms': ['slurry pump', 'P-102', 'recirc pump'],
      'area': 'Ore Processing Bay 2',
    },
    {
      'term': 'big press',
      'canonical': 'Industrial Hydraulic Stamping Press',
      'tag': 'HP-400',
      'category': 'slang',
      'synonyms': ['hydraulic press', 'HP-400', '400 ton press'],
      'area': 'Forming Cell A',
    },
    {
      'term': 'snort valve',
      'canonical': 'Pneumatic Rapid Pressure Relief Dump Valve',
      'tag': 'PRV-09',
      'category': 'component',
      'synonyms': ['bleed valve', 'dump valve', 'blowoff valve'],
      'area': 'Air Compressor House',
    },
    {
      'term': 'pecker head',
      'canonical': 'Electric Motor Terminal Conduit Connection Box',
      'tag': 'JB-MTR',
      'category': 'slang',
      'synonyms': ['motor junction box', 'terminal enclosure', 'T-box'],
      'area': 'All Plant Areas',
    },
    {
      'term': 'gland follower',
      'canonical': 'Mechanical Seal Packing Bushing & Retainer',
      'tag': 'MECH-SEAL',
      'category': 'component',
      'synonyms': ['packing gland', 'seal follower', 'compression ring'],
      'area': 'Pump House',
    },
  ];

  Color _getCategoryColor(String cat) {
    switch (cat) {
      case 'slang':
        return AppColors.accentCategorical1; // Orange
      case 'equipment_tag':
        return AppColors.accentCategorical2; // Blue
      default:
        return AppColors.accentCategorical3; // Teal
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _glossaryItems.where((item) {
      final q = _searchQuery.toLowerCase();
      if (q.isEmpty) return true;
      final term = (item['term'] as String).toLowerCase();
      final canonical = (item['canonical'] as String).toLowerCase();
      final tag = (item['tag'] as String).toLowerCase();
      final syns = (item['synonyms'] as List).join(' ').toLowerCase();
      return term.contains(q) || canonical.contains(q) || tag.contains(q) || syns.contains(q);
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(8.0)), // rounded.lg
        border: Border(
          top: BorderSide(color: AppColors.border, width: 1.0),
          left: BorderSide(color: AppColors.border, width: 1.0),
          right: BorderSide(color: AppColors.border, width: 1.0),
        ),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            width: 36.0,
            height: 4.0,
            margin: const EdgeInsets.only(top: 10.0, bottom: 8.0),
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2.0),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SectionHeader(
                  title: 'Plant Glossary & Slang Mapping',
                  padding: EdgeInsets.zero,
                ),
                ButtonIconTile(
                  icon: Icons.close_rounded,
                  size: 36.0,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              'WORKER SLANG AND EQUIPMENT TAGS MAP TO CANONICAL MANUAL TERMS.'
                  .toUpperCase(),
              style: AppTypography.caption,
            ),
          ),
          const SizedBox(height: 12.0),

          // Search Field
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted,
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: AppColors.border, width: 1.0),
              ),
              child: TextField(
                key: const Key('glossary_search_input'),
                onChanged: (val) => setState(() => _searchQuery = val),
                style: AppTypography.bodyMd,
                decoration: InputDecoration(
                  hintText: 'SEARCH SLANG, EQUIPMENT TAG, OR SYNONYM...',
                  hintStyle: AppTypography.labelUppercase.copyWith(fontSize: 11.5),
                  prefixIcon: const Icon(Icons.search_rounded, size: 18.0, color: AppColors.onSurfaceVariant),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12.0),
          const Divider(color: AppColors.border, height: 1.0),

          // Results list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final item = filtered[index];
                final term = item['term'] as String;
                final canonical = item['canonical'] as String;
                final tag = item['tag'] as String;
                final cat = item['category'] as String;
                final area = item['area'] as String;
                final syns = (item['synonyms'] as List).join(', ');
                final catColor = _getCategoryColor(cat);

                return Container(
                  margin: const EdgeInsets.only(bottom: 10.0),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(color: AppColors.border, width: 1.0),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(8.0),
                      onTap: () {
                        Navigator.of(context).pop();
                        widget.onSelectTerm?.call(canonical);
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                StatusDot(color: catColor, size: 8.0),
                                const SizedBox(width: 8.0),
                                Expanded(
                                  child: Text(
                                    term,
                                    style: AppTypography.bodyMd.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14.0,
                                    ),
                                  ),
                                ),
                                BadgePill(
                                  label: tag,
                                  color: catColor,
                                ),
                              ],
                            ),
                            const SizedBox(height: 6.0),
                            Text(
                              '→ $canonical',
                              style: AppTypography.bodySm.copyWith(
                                color: AppColors.onSurface,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 6.0),
                            Wrap(
                              spacing: 8.0,
                              children: [
                                Text(
                                  'AREA: $area'.toUpperCase(),
                                  style: AppTypography.caption,
                                ),
                                Text(
                                  'SYNS: $syns'.toUpperCase(),
                                  style: AppTypography.caption,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
