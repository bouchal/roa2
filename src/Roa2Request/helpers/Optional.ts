type Optional<T> = { [P in keyof T]? :T[P] }

export default Optional