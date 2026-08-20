# Example: Argyro Shared Renderer

The Stage 4 reference property demonstrated the intended scaling architecture:

- internal property identity remains `argyro`;
- EN route uses `/en/houses/argyro/`;
- DE route uses `/de/ferienhaeuser/argyro/`;
- both use one `HouseDetailPage` renderer;
- German long-form content is a separate localized content entry;
- inventory remains the factual source;
- localized presentation of inventory-derived text is mapped separately from facts;
- gallery alt/caption localization is presentation-only;
- a German route cannot exist without German content;
- generated-output tests check visible-language completeness and fact-binding.

The next-property test is whether a new German house can be added without another broad renderer refactor.
