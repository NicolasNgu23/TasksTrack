import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outlined';
};

export default function CustomButton({ title, onPress, variant = 'outlined' }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.base, isPrimary ? styles.primary : styles.outlined]}
    >
      <Text style={isPrimary ? styles.textPrimary : styles.textOutlined}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  primary: {
    backgroundColor: '#1C008A',
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#1C008A',
  },
  textPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textOutlined: {
    color: '#1C008A',
    fontSize: 16,
    fontWeight: '600',
  },
});
