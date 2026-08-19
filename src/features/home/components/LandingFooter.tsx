import { Fragment, useCallback } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';

// Published legal + contact pages, the same ones AccountButton links to. They
// have to stay reachable from a signed-out screen: it is the only place an
// anonymous visitor can get to them.
const LINKS = [
  { label: 'Privacy', url: 'https://weswapcards.com/privacy' },
  { label: 'Terms', url: 'https://weswapcards.com/terms' },
  { label: 'Contact', url: 'https://weswapcards.com/contact' },
] as const;

export default function LandingFooter() {
  const openExternal = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open', url);
    });
  }, []);

  return (
    <View style={homeStyles.footer}>
      <View style={homeStyles.footerLinks}>
        {LINKS.map((link, index) => (
          <Fragment key={link.label}>
            {index > 0 ? (
              <Text style={homeStyles.footerSeparator}>·</Text>
            ) : null}

            <Pressable
              onPress={() => openExternal(link.url)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              accessibilityRole="link"
            >
              <Text style={homeStyles.footerLink}>{link.label}</Text>
            </Pressable>
          </Fragment>
        ))}
      </View>

      <Text style={homeStyles.footerDisclaimer}>
        Not affiliated in any way with the official WeWard app.
      </Text>
    </View>
  );
}
