
#include "barretenberg/commitment_schemes/commitment_key.hpp"
#include "barretenberg/polynomials/polynomial.hpp"
#include "barretenberg/srs/factories/mem_bn254_crs_factory.hpp"
#include <benchmark/benchmark.h>

namespace bb {
auto& engine = numeric::get_debug_randomness();

template <typename Curve> std::shared_ptr<CommitmentKey<Curve>> create_commitment_key(const size_t num_points)
{
    bb::srs::init_crs_factory("../srs_db/ignition");
    std::string srs_path;
    return std::make_shared<CommitmentKey<Curve>>(num_points);
}

// Generate a polynomial with a specified number of nonzero random coefficients
template <typename FF> Polynomial<FF> sparse_random_poly(const size_t size, const size_t num_nonzero)
{
    auto polynomial = Polynomial<FF>(size);

    for (size_t i = 0; i < num_nonzero; i++) {
        size_t idx = engine.get_random_uint32() % size;
        polynomial.at(idx) = FF::random_element();
    }

    return polynomial;
}

constexpr size_t MIN_LOG_NUM_POINTS = 16;
constexpr size_t MAX_LOG_NUM_POINTS = 20;
constexpr size_t MAX_NUM_POINTS = 1 << MAX_LOG_NUM_POINTS;
constexpr size_t SPARSE_NUM_NONZERO = 100;

// Commit to a zero polynomial
template <typename Curve> void bench_commit_zero(::benchmark::State& state)
{
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    const auto polynomial = Polynomial<typename Curve::ScalarField>(num_points);
    for (auto _ : state) {
        key->commit(polynomial);
    }
}

// Commit to a polynomial with sparse nonzero entries equal to 1
template <typename Curve> void bench_commit_sparse(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    const size_t num_nonzero = SPARSE_NUM_NONZERO;

    auto polynomial = Polynomial<Fr>(num_points);
    for (size_t i = 0; i < num_nonzero; i++) {
        polynomial.at(i) = 1;
    }

    for (auto _ : state) {
        key->commit(polynomial);
    }
}

// Commit to a polynomial with sparse nonzero entries equal to 1 using the commit_sparse method to preprocess the input
template <typename Curve> void bench_commit_sparse_preprocessed(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    const size_t num_nonzero = SPARSE_NUM_NONZERO;

    auto polynomial = Polynomial<Fr>(num_points);
    for (size_t i = 0; i < num_nonzero; i++) {
        polynomial.at(i) = 1;
    }

    for (auto _ : state) {
        key->commit_sparse(polynomial);
    }
}

// Commit to a polynomial with sparse random nonzero entries
template <typename Curve> void bench_commit_sparse_random(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    const size_t num_nonzero = SPARSE_NUM_NONZERO;

    auto polynomial = sparse_random_poly<Fr>(num_points, num_nonzero);

    for (auto _ : state) {
        key->commit(polynomial);
    }
}

// Commit to a polynomial with sparse random nonzero entries using the commit_sparse method to preprocess the input
template <typename Curve> void bench_commit_sparse_random_preprocessed(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    const size_t num_nonzero = SPARSE_NUM_NONZERO;

    auto polynomial = sparse_random_poly<Fr>(num_points, num_nonzero);

    for (auto _ : state) {
        key->commit_sparse(polynomial);
    }
}

// Commit to a polynomial with dense random nonzero entries
template <typename Curve> void bench_commit_random(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    Polynomial<Fr> polynomial = Polynomial<Fr>::random(num_points);
    for (auto _ : state) {
        key->commit(polynomial);
    }
}
// Commit to a polynomial with dense random nonzero entries but NOT our happiest case of an exact power of 2
// Note this used to be a 50% regression just subtracting a power of 2 by 1.
template <typename Curve> void bench_commit_random_non_power_of_2(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    const size_t num_points = 1 << state.range(0);
    Polynomial<Fr> polynomial = Polynomial<Fr>::random(num_points - 1);
    for (auto _ : state) {
        key->commit(polynomial);
    }
}

// Generate a polynomial with a specified number of nonzero random coefficients
// 2^19 split into 8 regions of size 2^16, each 1/4 filled = 2^3 * 2^14 = 2^17 filled
template <typename FF> Polynomial<FF> structured_poly()
{

    constexpr size_t NUM_REGIONS = 1 << 3;
    constexpr size_t REGION_SIZE = 1 << 16;
    constexpr size_t NUM_TO_FILL = 1 << 14;

    auto result = Polynomial<FF>(NUM_REGIONS * REGION_SIZE);

    const auto fill_region = [&](const size_t region_idx) {
        for (size_t idx = region_idx * REGION_SIZE; idx < region_idx * REGION_SIZE + NUM_TO_FILL; idx++) {
            result.at(idx) = FF::random_element();
        };
    };

    for (size_t idx = 0; idx < NUM_REGIONS; idx++) {
        fill_region(idx); // fill 2^14 entries starting at i*2^16
    };

    return result;
}

// Generate a polynomial with a specified number of nonzero random coefficients
// 2^19 split into 8 regions of size 2^16, each 1/4 filled = 2^3 * 2^14 = 2^17 filled
template <typename FF> Polynomial<FF> dezero(const Polynomial<FF> in)
{
    constexpr size_t NUM_REGIONS = 1 << 3;
    constexpr size_t REGION_SIZE = 1 << 16;
    constexpr size_t NUM_TO_FILL = 1 << 14;

    auto result = Polynomial<FF>(NUM_TO_FILL * NUM_REGIONS);

    const auto copy_region = [&](const size_t region_idx) {
        for (size_t idx = 0; idx < NUM_TO_FILL; idx++) {
            result.at(region_idx * NUM_TO_FILL + idx) = in.at(region_idx * REGION_SIZE + idx);
        };
    };

    for (size_t idx = 0; idx < NUM_REGIONS; idx++) {
        copy_region(idx); // fill 2^17 by copying 8 regions of size 2^14
    };

    return result;
}

// Generate a polynomial with a specified number of nonzero random coefficients
// 2^19 split into 8 regions of size 2^16, each 1/4 filled = 2^3 * 2^14 = 2^17 filled
std::vector<g1::affine_element> fake_srs()
{
    constexpr size_t NUM_REGIONS = 1 << 3;
    constexpr size_t REGION_SIZE = 1 << 16;

    std::vector<g1::affine_element> result(NUM_REGIONS * REGION_SIZE);
    std::generate(result.begin(), result.end(), [&]() { return g1::affine_element::random_element(&engine); });

    return result;
}

// Generate a polynomial with a specified number of nonzero random coefficients
// 2^19 split into 8 regions of size 2^16, each 1/4 filled = 2^3 * 2^14 = 2^17 filled
std::vector<g1::affine_element> copy_fake_srs(const std::vector<g1::affine_element>& in)
{
    constexpr size_t NUM_REGIONS = 1 << 3;
    constexpr size_t REGION_SIZE = 1 << 16;
    constexpr size_t NUM_TO_FILL = 1 << 14;

    auto result = std::vector<g1::affine_element>(NUM_TO_FILL * NUM_REGIONS);

    const auto copy_region = [&](const size_t region_idx) {
        for (size_t idx = 0; idx < NUM_TO_FILL; idx++) {
            result.at(region_idx * NUM_TO_FILL + idx) = in.at(region_idx * REGION_SIZE + idx);
        };
    };

    for (size_t idx = 0; idx < NUM_REGIONS; idx++) {
        copy_region(idx); // fill 2^17 by copying 8 regions of size 2^14
    };

    return result;
}

template <typename Curve> void bench_commit_structured_basic(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    Polynomial<Fr> polynomial = structured_poly<Fr>();

    for (auto _ : state) {
        key->commit(polynomial);
    }
}

template <typename Curve> void bench_commit_structured_dezeroed(::benchmark::State& state)
{
    using Fr = typename Curve::ScalarField;
    auto key = create_commitment_key<Curve>(MAX_NUM_POINTS);

    Polynomial<Fr> polynomial = structured_poly<Fr>();
    std::vector<g1::affine_element> srs = fake_srs();

    for (auto _ : state) {
        Polynomial<Fr> dezeroed = dezero(polynomial);
        copy_fake_srs(srs);
        key->commit(dezeroed);
    }
}

BENCHMARK(bench_commit_zero<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_sparse<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_sparse_preprocessed<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_sparse_random<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_sparse_random_preprocessed<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_random<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_random_non_power_of_2<curve::BN254>)
    ->DenseRange(MIN_LOG_NUM_POINTS, MAX_LOG_NUM_POINTS)
    ->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_structured_basic<curve::BN254>)->Unit(benchmark::kMillisecond);
BENCHMARK(bench_commit_structured_dezeroed<curve::BN254>)->Unit(benchmark::kMillisecond);

} // namespace bb

BENCHMARK_MAIN();
