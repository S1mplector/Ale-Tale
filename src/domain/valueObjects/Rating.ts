export class Rating {
  private constructor(private readonly value: number) {
    if (value < 0 || value > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
  }

  static create(value: number): Rating {
    return new Rating(value);
  }

  getValue(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toFixed(1);
  }
}
