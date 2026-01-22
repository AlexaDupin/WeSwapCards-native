import { View, Image, Text, ImageSourcePropType } from 'react-native';
import { homeStyles } from "../../../assets/styles/home.styles";
import { SvgProps } from 'react-native-svg';

type StepsCardProps = {
    image: React.FC<SvgProps>;
    text: string;
  };

const StepsCard = ({ image: ImageComponent, text }: StepsCardProps) => {
  return (
    <View>
        <ImageComponent 
          width={150} height={150}
          style={{ marginTop: 10, alignSelf: 'center' }} 
        />
        <Text
          style={homeStyles.subtitle}
        >
            {text}
        </Text>
    </View>
  )
}

export default StepsCard