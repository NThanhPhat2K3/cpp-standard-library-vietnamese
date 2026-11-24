---
id: chuong-11-phan-13
title: 'Chương 11 · Reverse, rotate và hoán vị'
sidebar_label: '11 · Phần 13: Reverse, rotate và hoán vị'
---

# 11.8.1–11.8.3 · Đảo, xoay và hoán vị

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 583–588 (PDF trang 612–617). Các điều kiện biên được làm rõ.

## `reverse` và `reverse_copy`

`std::reverse(first,last)` đảo thứ tự phần tử tại chỗ; cần bidirectional iterator và khả năng hoán đổi phần tử. `reverse_copy(first,last,out)` ghi thứ tự đảo sang đích và trả iterator sau phần đã ghi. Nguồn và đích của `reverse_copy` không được chồng lấp; đích phải đủ chỗ hoặc dùng inserter.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    std::reverse(values.begin(), values.end());
    std::reverse(values.begin() + 1, values.end() - 1);
    assert((values == std::vector<int>{9,2,3,4,5,6,7,8,1}));
}
```

Đảo toàn bộ cho `9 8 7 6 5 4 3 2 1`; đảo tiếp phần giữa, không gồm hai đầu, cho `9 2 3 4 5 6 7 8 1`. Ví dụ cố định có đủ phần tử; với dữ liệu bất kỳ phải kiểm tra trước khi tạo `begin()+1` và `end()-1`. `list::reverse()` và `forward_list::reverse()` là thao tác thành viên phù hợp với danh sách liên kết.

## `rotate` và `rotate_copy`

`rotate(first,middle,last)` biến `[A,B)` thành `[B,A)` với `A=[first,middle)`, `B=[middle,last)`: phần tử tại `middle` cũ trở thành đầu nếu B không rỗng. Từ C++11, kết quả là iterator tới vị trí mới của phần tử đầu cũ, hoặc giá trị biên theo hợp đồng khi một phần rỗng.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    auto oldFirst = std::rotate(values.begin(), values.begin()+1, values.end());
    assert(*oldFirst == 1);
    std::rotate(values.begin(), values.end()-2, values.end());
    std::rotate(values.begin(), std::find(values.begin(), values.end(), 4), values.end());
    assert((values == std::vector<int>{4,5,6,7,8,9,1,2,3}));
}
```

Lần lượt dãy là `2 3 4 5 6 7 8 9 1`, `9 1 2 3 4 5 6 7 8`, rồi `4 5 6 7 8 9 1 2 3`. Sách mô tả `middle` phải thuộc `[first,last)`; thực tế `middle == first` hoặc `middle == last` là trường hợp biên hợp lệ, phạm vi không đổi. Với iterator không random access dùng `std::advance`/`next` khi số bước hợp lệ.

`rotate_copy(first,middle,last,out)` ghi dãy đã xoay sang đích, trả iterator sau phần ghi; nguồn và đích không được chồng lấp. Sách dùng `set` làm nguồn: `rotate_copy` chỉ đọc phần tử nên không thay đổi thứ tự set; để tìm khóa trong set nên cân nhắc `set::find`.

Ví dụ sau giữ nguyên set nguồn và ghi dãy bắt đầu từ khóa 4 vào vector:

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <set>
#include <vector>

int main() {
    const std::set<int> values{1, 2, 3, 4, 5};
    const auto middle = values.find(4);
    std::vector<int> rotated;
    std::rotate_copy(values.begin(), middle, values.end(),
                     std::back_inserter(rotated));
    assert((rotated == std::vector<int>{4, 5, 1, 2, 3}));
    assert((values == std::set<int>{1, 2, 3, 4, 5}));
}
```

Nếu khóa không tồn tại, `find()` trả `end()`; dùng nó làm `middle` hợp lệ và kết quả là bản sao không đổi. Nếu ứng dụng coi thiếu khóa là lỗi, hãy kiểm tra riêng trước khi gọi. Set không hỗ trợ cộng số nguyên trực tiếp với iterator; dùng `std::next` hoặc `std::advance` với số bước hợp lệ khi cần dịch vị trí.

## `next_permutation` và `prev_permutation`

Hai hàm biến đổi dãy sang hoán vị từ điển kế tiếp hoặc trước đó theo comparator và trả `true` khi tồn tại hoán vị tương ứng. Nếu không có, `next_permutation` đưa dãy về thứ tự đầu, `prev_permutation` đưa về thứ tự cuối, rồi trả `false`. Comparator cần strict weak ordering; iterator phải bidirectional và phần tử có thể hoán đổi.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3};
    int count = 0;
    do { ++count; } while (std::next_permutation(values.begin(), values.end()));
    assert(count == 6);
    assert((values == std::vector<int>{1,2,3}));
    bool hasPrevious = std::prev_permutation(values.begin(), values.end());
    assert(!hasPrevious && (values == std::vector<int>{3,2,1}));
}
```

Bắt đầu từ dãy tăng dần và dùng `do/while` để xử lý cả hoán vị ban đầu. Khi có giá trị tương đương, số thứ tự hoán vị phân biệt có thể ít hơn `n!`. Không dùng duyệt mọi hoán vị như phương pháp sắp xếp thực tế vì chi phí tăng rất nhanh.

Ví dụ với hai phần tử bằng nhau, chỉ có ba hoán vị phân biệt theo thứ tự mặc định:

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1, 1, 2};
    std::vector<std::vector<int>> permutations;
    do {
        permutations.push_back(values);
    } while (std::next_permutation(values.begin(), values.end()));
    assert(permutations.size() == 3);
    assert((permutations[0] == std::vector<int>{1, 1, 2}));
    assert((permutations[1] == std::vector<int>{1, 2, 1}));
    assert((permutations[2] == std::vector<int>{2, 1, 1}));
    assert((values == std::vector<int>{1, 1, 2})); // trở lại đầu
}
```

Nếu bắt đầu ở một hoán vị giữa dãy, vòng lặp chỉ đi từ đó đến hoán vị cuối trước khi trả `false`. Để duyệt toàn bộ theo một comparator, trước tiên sắp xếp phạm vi theo chính comparator đó.
