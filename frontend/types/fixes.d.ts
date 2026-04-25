import * as React from 'react';

declare module "expo-router" {
  export const useRouter: any;
  export const useLocalSearchParams: any;
  export const Link: any;
  export const Stack: any;
  export const router: any;
  export const usePathname: any;
  export const useSegments: any;
  export const useGlobalSearchParams: any;
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [elemName: string]: any;
    }
    interface ElementClass extends React.Component<any, any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

// Override RN components to match React 19's Component type
declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const SafeAreaView: any;
  export const ScrollView: any;
  export const KeyboardAvoidingView: any;
  export const TextInput: any;
  export const TouchableOpacity: any;
  export const FlatList: any;
  export const Platform: any;
  export const StyleSheet: any;
  export const StatusBar: any;
}
