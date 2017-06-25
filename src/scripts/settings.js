
export const UNIT_START_ENERGY_PER_CELL = 10;
export const REPRODUCTION_COST_PER_CELL = 1; // Energy cost to reproduce unit
export const ENERGY_COST_PER_CELL = 1;		// Energy cost per tick per cell
export const FOOD_GROWTH_RATE = 100;		// Amount of energy that food increases by every tick
export const FOOD_EAT_RATE = 10;			// Amount 1 eat cell can consume in 1 tick
export const ENERGY_STORAGE_PER_FAT = 200
export const DEFAULT_LIFE_SPAN = 60			// Amount of ticks before unit dies
export const FOOD_RADIUS = 100


export const REPRODUCTION_COST_THRESHOLD = 2 // A unit require's REPRODUCTION_COST_THRESHOLD X it's start energy before initiating reproduce

// Times (all in ms)
export const MATURATION_TIME = 5000
export const REPRODUCTION_TIME = 8000
export const MUTATION_TIME = 15000

// Simulation settings
export const ENGINE_STEP_TIMEOUT = 15 // ms to run engine loop step
export const GAME_STEP_TIMEOUT = 450 // ms interval for when to run the game loop
									  // This should be a multiple of ENGINE_STEP_TIMEOUT
export const ACTION_BROADCAST_TIMEOUT = 1200 // ms interval for the server seding out broadcasts



