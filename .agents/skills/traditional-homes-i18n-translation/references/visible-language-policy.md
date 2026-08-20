# Visible-Language Completeness Policy

A route declared as translated should render the target language for every translatable visible string.

Audit both normal text and user-facing attributes:

- headings and body copy;
- navigation and breadcrumbs;
- labels/buttons/forms;
- map text;
- derived property descriptions;
- grouping/pairing summaries;
- `aria-label`;
- `alt`;
- `title`;
- `placeholder`.

Acceptable unchanged strings include:

- property/place/person proper names;
- brand names;
- airport/transport codes;
- URLs;
- bare technical identifiers;
- numbers where no language is attached;
- intentional links to English-only pages when marked as English.

Do not validate by rejecting every English dictionary word. German and English share words, and proper names/brands are legitimate. Prefer generated-output parity checks, exact source-string checks, targeted vocabulary rules, and explicit allowlists whose failures name the offending string.
