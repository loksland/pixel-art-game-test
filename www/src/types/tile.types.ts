// Reference: https://doc.mapeditor.org/en/stable/reference/json-map-format/

// Map
// ---

export type TileMap = {
  /** The compression level to use for tile layer data (defaults to -1, which means to use the algorithm default) */
  compressionlevel: number;
  /** Editor specific settings that are generally not relevant when loading a map or tileset */
  editorsettings: unknown;
  /** Number of tile rows */
  width: number;
  /** Number of tile columns */
  height: number;
  /**  Map grid width */
  tilewidth: number;
  /** Map grid height */
  tileheight: number;
  /** Whether the map has infinite dimensions */
  infinite: boolean;
  /** Auto-increments for each layer */
  nextlayerid: number;
  /** Auto-increments for each placed object */
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  /** The Tiled version used to save the file */
  tiledversion: string;
  /** The JSON format version (previously a number, saved as string since 1.6) */
  version: string;
  type: 'map';
  layers: TileLayer[];
  tilesets: TileSet[];
} & TileMapOptional;

type TileMapOptional = {
  /** x or y (staggered / hexagonal maps only) */
  staggeraxis?: 'x' | 'y';
  /** odd or even (staggered / hexagonal maps only) */
  staggerindex?: 'odd' | 'even';
  /** Length of the side of a hex tile in pixels (hexagonal maps only) */
  hexsidelength?: number;
  /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
  backgroundcolor?: string;
};

// Layers
// ------

type TileLayer = {
  /** Row count. Same as map height for fixed-size maps. tilelayer only. */
  height?: number;
  /** Column count. Same as map width for fixed-size maps. tilelayer only. */
  width?: number;
  /** Incremental ID - unique across all layers */
  id: number;
  /** Name assigned to this layer */
  name: string;
  /** Value between 0 and 1 */
  opacity: 0.44;
  type: 'tilelayer' | 'objectgroup' | 'imagelayer' | 'group';
  /** Whether layer is shown or hidden in editor */
  visible: boolean;
  /** Horizontal layer offset in tiles. Always 0. */
  x: 0;
  /** Vertical layer offset in tiles. Always 0. */
  y: 0;
  /** Array of unsigned int (GIDs) or base64-encoded data. tilelayer only. */
  data?: number[];
} & TileLayerInfinite;

type TileLayerInfinite = {
  /** X coordinate where layer content starts (for infinite maps) */
  startx?: number;
  /** Y coordinate where layer content starts (for infinite maps) */
  starty?: number;
  /** Chunks are used to store the tile layer data for infinite maps. */
  chunks?: TileLayerChunk[];
};

type TileLayerChunk = {
  /** Height in tiles */
  height: number;
  /** Width in tiles */
  width: number;
  /** X coordinate in tiles */
  x: number;
  /** Y coordinate in tiles */
  y: number;
  /** Array of unsigned int (GIDs) or base64-encoded data */
  data: number[];
};

// Tile sets
// ---------

type TileSet = {
  /** The number of tile columns in the tileset */
  columns: number;
  /** GID corresponding to the first tile in the set */
  firstgid: number;
  /** Specifies common grid settings used for tiles in a tileset. See <grid> in the TMX Map Format. */
  grid?: TileSetGrid;
  /** Buffer between image edge and first tile (pixels) */
  margin: number;
  /** Name given to this tileset */
  name: string;
  /** Spacing between adjacent tiles in image (pixels) */
  spacing: 0;
  /** The number of tiles in this tileset */
  tilecount: number;
  /** Maximum width of tiles in this set */
  tilewidth: number;
  /** Maximum height of tiles in this set */
  tileheight: number;
  /** Array of Tiles (optional) */
  tiles?: Tile[];
};

type TileSetGrid = {
  /** Cell width of tile grid */
  width: number;
  /** Cell height of tile grid */
  height: number;
  /** orthogonal (default) or isometric */
  orientation: 'orthogonal' | 'isometric';
};

type Tile = {
  /** Local ID of the tile */
  id: number;
  /** Image representing this tile (optional, used for image collection tilesets) */
  image: string;
  /** Width of the tile image in pixels */
  imagewidth: number;
  /** Height of the tile image in pixels */
  imageheight: number;
};
