import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import Channels from '../app/channels';
import Goal from '../app/goal';
import Connections from '../app/connections';
import Photos from '../app/photos';
import Preview from '../app/preview';
import Budget from '../app/budget';
import Review from '../app/review';
import Dashboard from '../app/dashboard';
import { Workspace } from './domain/campaign';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { api } from './services/api';

let mockWorkspace: Workspace;
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
const mockListeners = new Set<() => void>();
const mockUpdate = jest.fn(async (change: (w: Workspace) => Workspace) => { mockWorkspace = change(mockWorkspace); mockListeners.forEach(listener => listener()); return mockWorkspace; });
jest.mock('expo-router', () => ({ useRouter: () => mockRouter, useFocusEffect: (callback: () => void) => { const React = jest.requireActual('react'); React.useEffect(callback, [callback]); } }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('./auth/AuthProvider', () => ({ useAuth: () => ({ demo: true }) }));
jest.mock('./state/WorkspaceProvider', () => ({ useWorkspace: () => { const React = jest.requireActual('react'); const data = React.useSyncExternalStore((listener: () => void) => { mockListeners.add(listener); return () => mockListeners.delete(listener); }, () => mockWorkspace); return { data, loading: false, error: '', update: mockUpdate, retry: jest.fn() }; } }));
jest.mock('./services/businessProfileStore', () => ({ loadBusinessProfile: async () => ({ name: 'Palms', location: 'Austin', description: 'Rooms near downtown.', destination: '', noWebsite: true, goal: 'calls' }), saveBusinessProfile: jest.fn(async () => {}) }));
jest.mock('./services/api', () => ({ api: jest.fn() }));
jest.mock('./services/photos', () => ({ savePhoto: async () => ({ id: 'photo', uri: 'local', mimeType: 'image/jpeg' }) }));
jest.mock('./PhotoView', () => ({ PhotoView: () => null }));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => '00000000-0000-4000-8000-000000000001') }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(), requestCameraPermissionsAsync: jest.fn() }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
let screen: ReactTestRenderer;
async function mount(Component: React.ComponentType) { await act(async () => { screen?.unmount(); screen = create(<Component />); }); }
function button(title: string) { const node = screen.root.findAll(n => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function').find(n => n.findAllByType(Text).some(text => text.props.children === title)); if (!node) throw new Error(`Missing button: ${title}`); return node; }
async function press(title: string) { await act(async () => { const node = button(title); expect(node.props.disabled).toBeFalsy(); await node.props.onPress(); }); }
async function change(label: string, value: string) { await act(async () => screen.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === label)!.props.onChangeText(value)); }
async function check(index = 0) { await act(async () => screen.root.findAll(n => n.props.accessibilityRole === 'checkbox' && typeof n.props.onPress === 'function')[index].props.onPress()); }
beforeEach(() => { jest.useRealTimers(); jest.clearAllMocks(); mockWorkspace = { draft: null, connections: [], campaigns: [] }; jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: false, assets: [{ uri: 'local', width: 100, height: 100 }] }); });
afterEach(async () => { await act(async () => screen?.unmount()); });
it('runs channel selection through photos, preview, approval and pause/stop without a website or provider calls', async () => {
  await mount(Goal); await press('Find my customers'); expect(mockRouter.push).toHaveBeenLastCalledWith('/channels');
  await mount(Channels); await press('Recommend a platform'); await press('Connect my accounts'); expect(mockRouter.push).toHaveBeenLastCalledWith('/connections');
  await mount(Connections); await press('Select sample account (demo)'); await press('Continue to my photos');
  await mount(Photos); await press('Choose from gallery'); expect(mockWorkspace.draft?.photos).toHaveLength(1); await press('Create my ad');
  await mount(Preview); await press('Prepare demo copy'); expect(mockWorkspace.draft?.copy).toHaveLength(1); await check(); await press('Looks good. Set my budget');
  await mount(Budget); await change('Business phone number (with country code)', '+15125550100'); await press('Review my promotion'); expect(mockRouter.push).toHaveBeenLastCalledWith('/review');
  await mount(Review); await check(); await press('Approve $100.00 demo & submit'); expect(mockWorkspace.campaigns).toHaveLength(1); expect(mockWorkspace.campaigns[0].status).toBe('submitted');
  await mount(Dashboard); await press('Simulate platform review'); await press('Simulate approval → active'); await press('Pause demo campaign'); expect(mockWorkspace.campaigns[0].status).toBe('paused');
  await press('Resume demo campaign'); await press('Stop demo campaign'); await press('Confirm stop'); expect(mockWorkspace.campaigns[0].status).toBe('completed'); expect(api).not.toHaveBeenCalled();
}, 30000);
it('does not move forward when a gallery action is cancelled', async () => {
  await mount(Channels); await press('Recommend a platform'); await press('Connect my accounts');
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
  await mount(Photos); await press('Choose from gallery'); expect(mockWorkspace.draft?.photos).toHaveLength(0); expect(button('Create my ad').props.disabled).toBe(true);
});
