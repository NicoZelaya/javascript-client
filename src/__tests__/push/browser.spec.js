import tape from 'tape-catch';
import MockAdapter from 'axios-mock-adapter';
import { testAuthWithPushDisabled, testAuthWith401, testNoEventSource, testNoBase64Support } from '../browserSuites/push-initialization-fails.spec';
import { testAuthRetries, testSSERetries } from '../browserSuites/push-initialization-retries.spec';
import { testSynchronization } from '../browserSuites/push-synchronization.spec';

import { __getAxiosInstance } from '../../services/transport';

const mock = new MockAdapter(__getAxiosInstance());

tape('## Browser JS - E2E CI Tests for PUSH ##', function (assert) {

  assert.test('E2E / PUSH initialization: auth with push disabled', testAuthWithPushDisabled.bind(null, mock));
  assert.test('E2E / PUSH initialization: auth with 401', testAuthWith401.bind(null, mock));
  assert.test('E2E / PUSH initialization: fallback to polling if EventSource is not available', testNoEventSource.bind(null, mock));
  assert.test('E2E / PUSH initialization: fallback to polling if EventSource is not available', testNoBase64Support.bind(null, mock));

  assert.test('E2E / PUSH initialization: auth fails and then success', testAuthRetries.bind(null, mock));
  assert.test('E2E / PUSH initialization: SSE connection fails and then success', testSSERetries.bind(null, mock));

  assert.test('E2E / PUSH synchronization: SPLIT_UPDATE event', testSynchronization.bind(null, mock));

  assert.end();
});