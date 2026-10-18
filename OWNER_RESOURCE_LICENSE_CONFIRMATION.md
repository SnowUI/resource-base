# Owner resource license confirmation

Date: 2026-10-18

The SnowUI Owner confirms that all assets in the approved raw source set identified below have the required permissions and that the Owner personally verified the applicable rights. This confirmation covers the complete current `raw-assets/` collection in `resource-base`; it does not automatically extend to any later added or modified asset. No external source version is asserted where `sourceVersion` is `null`.

- Approved source set: 7,810 allowed raw asset files, represented by sorted `raw-assets/...` paths relative to `resource-base/` and each file's SHA-256.
- Approved source-set SHA-256: `6881d6a490a36a0be35c47d9422a3834e232aafa43f9d637919761a3ff5de3b6`.
- SnowUI-created assets are licensed under MIT.
- Phosphor Icons are distributed under their original MIT license; retain the full upstream copyright and license text in `THIRD_PARTY_NOTICES.md`.
- Other third-party assets retain their original licenses as individually verified by the Owner. This record does not relicense those assets as MIT. The applicable original license text and its particulars are not inferred here.
- Logo and brand marks retain their brand/trademark status; this record does not grant trademark rights.

The source-set hash is computed as SHA-256 over sorted lines of `relative path`, a NUL byte, and the file SHA-256, with lines joined by LF. The generator verifies this value against the live raw source set. Any addition, deletion, rename, or content change requires a new Owner confirmation and updated approved hash before the publication check can pass.
