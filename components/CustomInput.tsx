import { TextInput, StyleSheet, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  multiline?: boolean;
};

export default function CustomInput(props: Props) {
  return (
    <TextInput
      style={[
        styles.input,
        props.multiline ? styles.textArea : null,
        props.style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
