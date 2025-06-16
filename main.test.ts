import {Platform} from './main';
import {Testing} from 'cdk8s';

describe('Platform', () => {
  test('Should synthesize correctly', () => {
    const app = Testing.app();
    const chart = new Platform(app, 'test-chart');
    const results = Testing.synth(chart)
    expect(results).toMatchSnapshot();
  });
});
