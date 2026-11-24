---
id: chuong-11-phan-14
title: 'Chương 11 · Shuffle và partition'
sidebar_label: '11 · Phần 14: Shuffle và partition'
---

# 11.8.4–11.8.6 · Xáo trộn và phân vùng

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 589–595 (PDF trang 618–624). Các lưu ý phiên bản và lỗi ví dụ được nêu riêng.

## `shuffle`

`std::shuffle(first,last,engine)` xáo trộn phạm vi random-access bằng uniform random bit generator. Engine có trạng thái và được sử dụng trong quá trình xáo trộn; giữ engine bên ngoài giúp kiểm soát và tiếp tục trạng thái giữa các lời gọi.

```cpp
#include <algorithm>
#include <cassert>
#include <random>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    std::mt19937 engine(42);
    std::shuffle(values.begin(), values.end(), engine);
    std::sort(values.begin(), values.end());
    assert((values == std::vector<int>{1,2,3,4,5,6,7,8,9}));
}
```

Seed cố định hữu ích khi kiểm thử, nhưng không nên hứa thứ tự `shuffle` giống nhau giữa mọi implementation. Engine tiêu chuẩn thông thường không phải lựa chọn mật mã chỉ vì tên có chữ random; chọn nguồn phù hợp với bài toán.

Sách cũng mô tả `random_shuffle`, API lịch sử đã bị loại khỏi chuẩn C++17; mã mới dùng `shuffle`. Ví dụ `MyRandom` trong sách tính `rand()/RAND_MAX * max`: khi `rand() == RAND_MAX`, kết quả có thể bằng `max`, vi phạm yêu cầu giá trị phải nhỏ hơn `max`. Không sao chép generator đó như một implementation an toàn.

## `partition` và `stable_partition`

Hai hàm chia phạm vi thành nhóm predicate đúng trước nhóm sai và trả iterator đầu nhóm sai. `stable_partition` giữ thứ tự tương đối trong **cả hai nhóm**; `partition` không bảo đảm thứ tự bên trong nhóm. Khi tất cả phần tử đúng, iterator trả về là `end()` và không được dereference.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    auto boundary = std::stable_partition(values.begin(), values.end(),
                                           [](int x) { return x % 2 == 0; });
    assert((values == std::vector<int>{2,4,6,8,1,3,5,7,9}));
    assert(boundary != values.end() && *boundary == 1);
}
```

Sách minh họa `partition` có thể tạo `8 2 6 4 5 3 7 1 9`; đó chỉ là một kết quả hợp lệ, không phải thứ tự bắt buộc. `stable_partition` có thể dùng bộ nhớ phụ và độ phức tạp hoán đổi phụ thuộc điều kiện triển khai. Predicate phải phù hợp với hợp đồng và không nên phụ thuộc vào thứ tự hoặc số lần gọi không được bảo đảm.

### Kiểm tra vùng đã phân chia

C++11 còn có `is_partitioned` và `partition_point` để kiểm tra và tìm ranh giới theo predicate. `partition_point` yêu cầu phạm vi đã được phân chia theo predicate đó; nó không tự phân chia dữ liệu.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{2, 4, 6, 1, 3};
    const auto even = [](int x) { return x % 2 == 0; };
    assert(std::is_partitioned(values.begin(), values.end(), even));
    auto boundary = std::partition_point(values.begin(), values.end(), even);
    assert(boundary == values.begin() + 3 && *boundary == 1);

    const std::vector<int> unordered{2, 1, 4};
    assert(!std::is_partitioned(unordered.begin(), unordered.end(), even));
    // Không gọi partition_point trên unordered với predicate này.
}
```

Nếu mọi phần tử thỏa predicate, ranh giới là `end()`; nếu không phần tử nào thỏa, ranh giới là `begin()`. Phạm vi rỗng cũng có `begin() == end()`. Luôn kiểm tra trước khi dereference iterator ranh giới.

## `partition_copy`

`std::partition_copy(first,last,trueOut,falseOut,pred)` ghi phần tử thỏa predicate vào đích thứ nhất và phần còn lại vào đích thứ hai; trả cặp iterator sau mỗi vùng đã ghi. Thứ tự tương đối của phần tử trong từng đích được giữ. Nguồn và đích phải hợp lệ, có đủ chỗ hoặc dùng inserter, đồng thời đáp ứng điều kiện không chồng lấp của thuật toán.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> source{1,6,33,7,22,4,11,33,2,7,0,42,5};
    std::vector<int> even, odd;
    std::partition_copy(source.cbegin(), source.cend(),
                        std::back_inserter(even), std::back_inserter(odd),
                        [](int x) { return x % 2 == 0; });
    assert((even == std::vector<int>{6,22,4,2,0,42}));
    assert((odd == std::vector<int>{1,33,7,11,33,7,5}));
}
```

Nếu chỉ cần một trong hai nhóm, có thể dùng `copy_if` hoặc `remove_copy_if` với điều kiện tương ứng. Với partition tại chỗ, nguồn bị đổi thứ tự; `partition_copy` để nguồn không đổi và ghi vào hai đích.
