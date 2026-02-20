# Sparky Fitness

SparkyFitness: Built for Families. Powered by AI. Track food, fitness, water, and health — together.
A self-hosted, privacy-first alternative to MyFitnessPal. Track nutrition, exercise, body metrics, and health data while keeping full control of your data.


## Example

```yaml
- Fitness:
    - Sparky Fitness:
        href: http://your-sparky-ip:8080
        description: Daily Nutrition Stats
        icon: /icons/sparkyfitness.png  # Place your icon in public/icons/
        widget:
          type: sparkyfitness
          url: http://your-sparky-ip:3010
          key: your_sparky_api_key
```

## Configuration

| Field | Description |
| :--- | :--- |
| `url` | The URL of your Sparky Fitness server (e.g., `http://192.168.1.50:3010`). |
| `key` | Your Sparky Fitness API Key, generated in the server settings. |
