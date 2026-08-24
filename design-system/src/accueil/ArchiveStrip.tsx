import type { ReactNode } from "react";

export interface ArchivePhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ArchiveStripProps {
  /** Les photographies versees au dossier. */
  photos: ArchivePhoto[];
  /** La legende : les editions montrees et le credit photo. */
  caption?: ReactNode;
}

/**
 * La bande d'archives : des tirages alignes sur une bande, comme des
 * pieces versees a un dossier. Legende obligatoire quand les photos
 * sont creditees.
 */
export function ArchiveStrip({ photos, caption }: ArchiveStripProps) {
  return (
    <figure className="arch">
      <ul className="arch-strip">
        {photos.map((photo) => (
          <li key={photo.src}>
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
            />
          </li>
        ))}
      </ul>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
