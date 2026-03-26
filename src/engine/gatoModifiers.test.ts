
import { applyGravity } from './gatoModifiers.ts';
import type { Player } from '../types.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
}

function testApplyGravity() {
  console.log('Running tests for applyGravity...');

  // --- 3x3 Grid Cases ---
  const size3 = 3;

  // Empty 3x3 board
  let board3: (Player | null)[] = Array(9).fill(null);
  assert(applyGravity(board3, 0, size3) === 6, '3x3: Col 0 empty should return 6');
  assert(applyGravity(board3, 1, size3) === 7, '3x3: Col 1 empty should return 7');
  assert(applyGravity(board3, 2, size3) === 8, '3x3: Col 2 empty should return 8');

  // Partially filled 3x3 col 0
  board3[6] = 'X'; // Bottom row
  assert(applyGravity(board3, 0, size3) === 3, '3x3: Col 0 with 1 piece should return 3');

  board3[3] = 'O'; // Middle row
  assert(applyGravity(board3, 0, size3) === 0, '3x3: Col 0 with 2 pieces should return 0');

  // Completely full 3x3 col 0
  board3[0] = 'X'; // Top row
  assert(applyGravity(board3, 0, size3) === -1, '3x3: Col 0 full should return -1');

  // --- 4x4 Grid Cases ---
  const size4 = 4;
  let board4: (Player | null)[] = Array(16).fill(null);

  // Empty 4x4
  assert(applyGravity(board4, 0, size4) === 12, '4x4: Col 0 empty should return 12');
  assert(applyGravity(board4, 3, size4) === 15, '4x4: Col 3 empty should return 15');

  // Partially filled 4x4 col 2
  board4[14] = 'X'; // Row 3
  board4[10] = 'O'; // Row 2
  assert(applyGravity(board4, 2, size4) === 6, '4x4: Col 2 with pieces at row 3 and 2 should return 6');

  board4[6] = 'X';  // Row 1
  assert(applyGravity(board4, 2, size4) === 2, '4x4: Col 2 with pieces at row 3, 2, 1 should return 2');

  // Completely full 4x4 col 2
  board4[2] = 'O';  // Row 0
  assert(applyGravity(board4, 2, size4) === -1, '4x4: Col 2 full should return -1');

  // --- 5x5 Grid Cases ---
  const size5 = 5;
  let board5: (Player | null)[] = Array(25).fill(null);

  // Empty 5x5
  assert(applyGravity(board5, 0, size5) === 20, '5x5: Col 0 empty should return 20');
  assert(applyGravity(board5, 4, size5) === 24, '5x5: Col 4 empty should return 24');

  // Partially filled 5x5 col 1
  board5[21] = 'X'; // Row 4
  board5[16] = 'O'; // Row 3
  board5[6] = 'X';  // Row 1
  // Row 2 (index 11) is empty
  assert(applyGravity(board5, 1, size5) === 11, '5x5: Col 1 with gap at row 2 should return 11');

  console.log('All tests passed!');
}

try {
  testApplyGravity();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
