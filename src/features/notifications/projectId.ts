import Constants from 'expo-constants';

/**
 * The EAS projectId is required by `getExpoPushTokenAsync({ projectId })`.
 * It is populated by `eas init` into app.json (`extra.eas.projectId`) and is
 * also exposed at runtime via `Constants.easConfig`. Read both so it resolves
 * in dev builds and EAS builds alike.
 */
export function getProjectId(): string | undefined {
  const fromExtra = (Constants?.expoConfig as any)?.extra?.eas?.projectId;
  const fromEas = (Constants as any)?.easConfig?.projectId;
  return fromExtra ?? fromEas ?? undefined;
}
