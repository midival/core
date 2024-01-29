import { type Omnibus } from "@hypersphere/omnibus"

export type OmnibusKeys<O> = O extends Omnibus<infer K> ? keyof K : never

export type OmnibusValue<O, K extends OmnibusKeys<O>> = O extends Omnibus<infer A> ? A[K][0] : never
export type OmnibusParams<O, K extends OmnibusKeys<O>> = O extends Omnibus<infer A> ? A[K] : never
