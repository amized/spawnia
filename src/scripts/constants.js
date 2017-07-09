



export const LIFESTATE_UNBORN = "UNBORN";
export const LIFESTATE_CHILD = "SEEDLING";
export const LIFESTATE_MATURE = "MATURE";
export const LIFESTATE_DEAD = "DEAD";


export const PLAYSTATE_PLAYING = "PLAYING";
export const PLAYSTATE_PAUSE = "PAUSED";


export const COLLISION_CATEGORY_DEFAULT = 0x0001
export const COLLISION_CATEGORY_UNITS = 0x0002
export const COLLISION_CATEGORY_FOOD = 0x0004
export const COLLISION_CATEGORY_BARRIER = 0x0008

export const MAP_OBJ_GENERAL = "GENERAL";
export const MAP_OBJ_FOOD = "FOOD";
export const MAP_OBJ_UNIT = "UNIT";


export const GAME_MODE_INTRO = "INTRO";
export const GAME_MODE_SETUP = "SETUP";
export const GAME_MODE_STARTED = "STARTED";

export const GAME_STAGE_NOGAME = 0;
export const GAME_STAGE_BUILDINGSPECIES = 1;
export const GAME_STAGE_PLACESPECIES = 2;
export const GAME_STAGE_READY_TO_START = 3;
export const GAME_STAGE_WATCHING = 4;
export const GAME_STAGE_ENDED = 5;
export const GAME_STAGE_ENDED_TIMEOUT = 6;
export const GAME_STAGE_ENDED_DEATH = 7;

export const CONN_STATUS_WAITING = 1

// Sync statuses
export const SYNC_STATUS_WAITING = 0
export const SYNC_STATUS_SYNCED = 1


// Allowed cell types
export const ALLOWED_CELLTYPE_ANY = 1