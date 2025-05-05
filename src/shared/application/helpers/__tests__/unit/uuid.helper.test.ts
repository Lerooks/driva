import { UUID } from '../../uuid.helper';

describe('UUID', () => {
  it('should generate a valid UUID v4', () => {
    const uuid = UUID.generate();

    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(uuid).toMatch(uuidV4Regex);
  });

  it('should generate different UUIDs for each call', () => {
    const uuid1 = UUID.generate();
    const uuid2 = UUID.generate();

    expect(uuid1).not.toEqual(uuid2);
  });
});
