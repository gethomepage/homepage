export function formatDuration(seconds) {
  const hours = Math.floor(seconds / (60 * 60));
  const formattedHours = new Intl.NumberFormat().format(hours);
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  let result = "";
  if (hours > 0) result += `${formattedHours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (secs > 0 || seconds < 60) result += `${secs}s`;

  return result.trim();
}

export const formatInternalName = {

  gamephase: (gamePhase) => {

    const parts = gamePhase.split("/");
    const lastPart = parts[parts.length - 1];
    const phaseName = lastPart.split(".")[1].slice(0, -1);
    const phaseMapping = {
      GP_Project_Assembly_Phase_0: "Onboarding",
      GP_Project_Assembly_Phase_1: "Distribution Platform",
      GP_Project_Assembly_Phase_2: "Construction Dock",
      GP_Project_Assembly_Phase_3: "Main Body",
      GP_Project_Assembly_Phase_4: "Propulsion",
      GP_Project_Assembly_Phase_5: "Assembly",
      GP_Project_Assembly_Phase_6: "Launch",
      GP_Project_Assembly_Phase_7: "Completed",
    };

    const formattedPhase = phaseMapping[phaseName] || "N/A";

    return formattedPhase;
  },

  schematic: (schematic) => {

    const parts = schematic.split("/");
    const lastPart = parts[parts.length - 1];
    const schematicName = lastPart.split(".")[0];
    const schematicMapping = {
      // Tier 1
      "Schematic_1-1": "Base Building",
      "Schematic_1-2": "Logistics",
      "Schematic_1-3": "Field Research",
      // Tier 2
      "Schematic_2-1": "Part Assembly",
      "Schematic_2-2": "Obstacle Clearing",
      "Schematic_2-3": "Jump Pads",
      "Schematic_2-5": "Resource Sink Bonus Program",
      "Schematic_3-2": "Logistics Mk.2",
      // Tier 3
      "Schematic_3-1": "Coal Power",
      "Schematic_3-3": "Vehicular Transport",
      "Schematic_3-4": "Basic Steel Production",
      "Schematic_4-2": "Enhanced Asset Security",
      // Tier 4
      "Schematic_4-5": "FICSIT Blueprints",
      "Schematic_5-3": "Logistics Mk.3",
      "Schematic_4-1": "Advanced Steel Production",
      "Schematic_4-3": "Expanded Power Infrastructure",
      "Schematic_4-4": "Hypertubes",
      // Tier 5
      "Schematic_6-2": "Jetpack",
      "Schematic_5-1": "Oil Processing",
      "Schematic_6-1": "Logistics Mk.4",
      "Schematic_5-4": "Fluid Packaging",
      "Schematic_5-5": "Petroleum Power",
      // Tier 6
      "Schematic_5-2": "Industrial Manufacturing",
      "Schematic_6-3": "Monorail Train Technology",
      "Schematic_6-7": "Railway Signaling",
      "Schematic_6-5": "Pipeline Engineering Mk.2",
      "Schematic_6-6": "FICSIT Blueprints Mk.2",
      // Tier 7
      "Schematic_7-1": "Bauxite Refinement",
      "Schematic_8-3": "Hoverpack",
      "Schematic_7-2": "Logistics Mk.5",
      "Schematic_7-3": "Hazmat Suit",
      "Schematic_7-5": "Control System Development",
      // Tier 8
      "Schematic_7-4": "Aeronautical Engineering",
      "Schematic_8-1": "Nuclear Power",
      "Schematic_8-2": "Advanced Aluminum Production",
      "Schematic_8-4": "Leading Edge Production",
      "Schematic_8-5": "Particle Enrichment",
      // Tier 9
      "Schematic_9-1": "Matter Conversion",
      "Schematic_9-2": "Quantum Encoding",
      "Schematic_9-3": "FICSIT Blueprints Mk.3",
      "Schematic_9-4": "Spatial Energy Regulation",
      "Schematic_9-5": "Peak Efficiency",

    };

    const formattedSchematic = schematicMapping[schematicName] || schematicName;

    return formattedSchematic;
  },
};
