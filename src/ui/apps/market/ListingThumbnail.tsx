import type { Listing } from "../../../core/model";
import { visualHash } from "../../visualHash";
const colors = [
  "#d36f4b",
  "#467a75",
  "#d3a832",
  "#6a7391",
  "#a45d62",
  "#688b59",
];
export function listingVisualVariant(
  identity: string,
  category: Listing["category"],
) {
  const h = visualHash(identity);
  return {
    scene: h % 4,
    palette: (h >>> 4) % colors.length,
    composition: (h >>> 8) % 3,
    category,
  };
}
export function ListingThumbnail({
  listing,
  large = false,
}: {
  listing: Listing;
  large?: boolean;
}) {
  const v = listingVisualVariant(
      `${listing.id}:${listing.title}`,
      listing.category,
    ),
    color = colors[v.palette],
    common = { fill: color },
    vehicle = [
      "M42 137h230l-18-40-66-17h-78L78 99Z",
      "M38 138h242l-20-35-76-20h-75l-35 20Z",
      "M58 139h204l-12-47-54-17h-66L90 96Z",
      "M45 138h226v-49h-58l-31-18h-70L78 91H45Z",
    ][v.scene];
  return (
    <svg
      className={`listing-thumbnail ${large ? "large" : ""}`}
      viewBox="0 0 320 210"
      role="img"
      aria-label={`${listing.title} için stilize ilan görseli`}
      data-visual-variant={`${listing.category}-${v.scene}-${v.palette}-${v.composition}`}
    >
      <rect
        width="320"
        height="210"
        fill={["#f7e9ca", "#dce7df", "#eadccf"][v.composition]}
      />
      <circle
        cx={v.composition === 1 ? 55 : 265}
        cy="46"
        r="28"
        fill="#f7c85f"
        opacity=".55"
      />
      {listing.category === "Vasıta" && (
        <g transform={v.composition === 2 ? "translate(8 2) scale(.95)" : ""}>
          <path d={vehicle} {...common} />
          <circle
            cx="105"
            cy="143"
            r={v.scene === 3 ? 22 : 25}
            fill="#383a39"
          />
          <circle
            cx="230"
            cy="143"
            r={v.scene === 3 ? 22 : 25}
            fill="#383a39"
          />
          <circle cx="105" cy="143" r="9" fill="#b8b0a0" />
          <circle cx="230" cy="143" r="9" fill="#b8b0a0" />
        </g>
      )}
      {listing.category === "Emlak" &&
        (v.scene === 0 ? (
          <g>
            <path d="M62 184V55h196v129" fill="#eee7d7" />
            <path
              d="M83 77h42v42H83zm66 0h42v42h-42zm66 0h22v88h-22z"
              fill={color}
            />
          </g>
        ) : v.scene === 1 ? (
          <g>
            <rect x="51" y="49" width="218" height="135" fill="#f5eee0" />
            <rect x="73" y="69" width="75" height="63" fill="#88afb0" />
            <path d="M168 135h80v48h-80z" {...common} />
          </g>
        ) : v.scene === 2 ? (
          <g>
            <path d="M55 65h210v119H55z" fill="#f7f0e5" />
            <path d="M75 130h100v54H75zM190 83h55v101h-55z" {...common} />
          </g>
        ) : (
          <g>
            <rect x="45" y="48" width="230" height="136" fill="#f6efe4" />
            <rect x="68" y="66" width="100" height="74" fill="#8bb1b2" />
            <path
              d="M185 135h72v15h-72zm8 15h8v34h-8zm48 0h8v34h-8z"
              {...common}
            />
          </g>
        ))}
      {listing.category === "Elektronik" &&
        (v.scene === 0 ? (
          <g>
            <rect
              x="70"
              y="50"
              width="180"
              height="112"
              rx="9"
              fill="#333a3d"
            />
            <rect x="79" y="59" width="162" height="94" fill={color} />
            <path d="M44 163h232l-20 21H64Z" fill="#777e7e" />
          </g>
        ) : v.scene === 1 ? (
          <g fill="none" stroke={color} strokeWidth="20">
            <path d="M92 118V92a68 68 0 0 1 136 0v26" />
            <path d="M91 111v48m138-48v48" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <rect
              x="104"
              y="45"
              width="112"
              height="145"
              rx="21"
              fill="#343a3b"
            />
            <rect x="114" y="59" width="92" height="105" rx="8" fill={color} />
            <circle cx="160" cy="177" r="6" fill="#aaa" />
          </g>
        ))}
      {listing.category === "Ev & Yaşam" &&
        (v.scene === 0 ? (
          <g>
            <path
              d="M70 86h180v26H70zM84 112h12v72H84zM224 112h12v72h-12z"
              {...common}
            />
          </g>
        ) : v.scene === 1 ? (
          <g>
            <path
              d="M105 73h110v72H105zM119 145h14v39h-14zM187 145h14v39h-14z"
              {...common}
            />
            <path
              d="M98 95H75v89"
              fill="none"
              stroke="#6b5747"
              strokeWidth="13"
            />
          </g>
        ) : v.scene === 2 ? (
          <g>
            <path d="M85 48h150v136H85z" {...common} />
            <path d="M85 88h150M85 132h150" stroke="#f4e8d3" strokeWidth="8" />
          </g>
        ) : (
          <g>
            <path d="M64 110h192v74H64z" {...common} />
            <path d="M82 91h58v19H82zm94-24h62v43h-62z" fill="#6b5747" />
          </g>
        ))}
      <path d="M20 185h280" stroke="#9f8d6d" strokeWidth="3" opacity=".35" />
    </svg>
  );
}
