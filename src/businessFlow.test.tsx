import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import Business from '../app/business';
import { loadBusinessProfile, saveBusinessProfile } from './services/businessProfileStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual('react');
    React.useEffect(() => callback(), [callback]);
  },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('./services/businessProfileStore', () => ({ loadBusinessProfile: jest.fn(), saveBusinessProfile: jest.fn() }));

const draft = { name: 'The Palms', location: 'Austin', description: 'A motel', destination: '' };
let screen: ReactTestRenderer;
const checkbox = () => screen.root.findAll((node) => node.props.accessibilityRole === 'checkbox' && typeof node.props.onPress === 'function')[0];
const submit = () => screen.root.findAll((node) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function').find((node) => node.findAllByType(Text).some((text) => ['Save and continue', 'Saving…'].includes(text.props.children)))!;

beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.mocked(loadBusinessProfile).mockResolvedValue(draft);
  jest.mocked(saveBusinessProfile).mockResolvedValue();
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });

it('continues without a website after explicit opt out', async () => {
  await act(async () => { screen = create(<Business />); });
  await act(async () => checkbox().props.onPress());
  expect(screen.root.findAllByType(TextInput).some((node) => node.props.accessibilityLabel === 'Website or booking link')).toBe(false);
  await act(async () => submit().props.onPress());
  expect(saveBusinessProfile).toHaveBeenCalledWith(expect.objectContaining({ noWebsite: true, destination: '' }));
  expect(mockPush).toHaveBeenCalledWith('/goal');
});

it('restores a saved opt out and requires the link again when unchecked', async () => {
  jest.mocked(loadBusinessProfile).mockResolvedValue({ ...draft, noWebsite: true });
  await act(async () => { screen = create(<Business />); });
  expect(checkbox().props.accessibilityState.checked).toBe(true);
  await act(async () => checkbox().props.onPress());
  await act(async () => submit().props.onPress());
  expect(saveBusinessProfile).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
  expect(screen.root.findAllByType(Text).some((node) => node.props.children === 'Add a website or booking link.')).toBe(true);
});

it('stays on the form when saving fails, then allows retry', async () => {
  jest.mocked(loadBusinessProfile).mockResolvedValue({ ...draft, noWebsite: true });
  jest.mocked(saveBusinessProfile).mockRejectedValueOnce(new Error('Storage full'));
  await act(async () => { screen = create(<Business />); });
  await act(async () => submit().props.onPress());
  expect(mockPush).not.toHaveBeenCalled();
  expect(submit().props.disabled).toBe(false);
  await act(async () => submit().props.onPress());
  expect(mockPush).toHaveBeenCalledTimes(1);
});

it('does not save or navigate twice on repeated taps', async () => {
  jest.mocked(loadBusinessProfile).mockResolvedValue({ ...draft, noWebsite: true, goal: 'calls' });
  await act(async () => { screen = create(<Business />); });
  await act(async () => {
    const press = submit().props.onPress;
    await Promise.all([press(), press()]);
  });
  expect(saveBusinessProfile).toHaveBeenCalledTimes(1);
  expect(saveBusinessProfile).toHaveBeenCalledWith(expect.objectContaining({ goal: 'calls' }));
  expect(mockPush).toHaveBeenCalledTimes(1);
});
