# Example: UI and Attribute Localization

Visible-language completeness includes strings that are easy to miss because they do not appear as paragraph copy.

The German reference implementation required localization of:

- map-card parking/access text;
- `Village Map` heading;
- host honorifics;
- layout/access/bathroom summaries;
- region display name;
- group/pairing summaries;
- gallery captions;
- breadcrumb accessibility wording.

Generated-output QA must also inspect `aria-label`, `alt`, `title`, and `placeholder` attributes.

When a string represents a fact, localize presentation around the source fact rather than moving the fact itself into locale resources.
