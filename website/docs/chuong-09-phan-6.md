---
id: chuong-09-phan-6
title: 'Chương 9 · Iterator traits và tag dispatch'
sidebar_label: '09 · Phần 6: Iterator traits'
---

# 9.5 · Iterator traits và tag dispatch

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 466–470 (PDF trang 495–499). Ví dụ được viết lại tự đủ cho C++11.

## Iterator tag

`<iterator>` định nghĩa các tag để mô tả nhóm iterator trong mô hình truyền thống. Tag forward kế thừa input; bidirectional kế thừa forward; random access kế thừa bidirectional. Output tag là nhánh riêng. Một forward iterator có khả năng ghi có thể thỏa yêu cầu output, nhưng việc đó không được biểu diễn bằng kế thừa từ `output_iterator_tag`.

Tag không tự tạo ra khả năng: iterator công bố category phải thực sự đáp ứng các yêu cầu của category đó. C++20 còn bổ sung `contiguous_iterator_tag` và iterator concepts; legacy category và concept có vai trò liên quan nhưng không hoàn toàn đồng nhất.

## `iterator_traits`

`std::iterator_traits<It>` là giao diện tra cứu các kiểu liên quan đến iterator:

| Kiểu | Ý nghĩa |
|:---|:---|
| `iterator_category` | Tag mô tả nhóm iterator truyền thống. |
| `value_type` | Kiểu giá trị gắn với iterator. |
| `difference_type` | Kiểu có dấu để biểu diễn khoảng cách. |
| `pointer` | Kiểu con trỏ liên quan, nếu được định nghĩa. |
| `reference` | Kiểu kết quả tham chiếu hoặc proxy liên quan. |

Với iterator class theo mô hình sách, traits thường lấy các alias bên trong class. Traits còn có chuyên biệt cho con trỏ: `int*` hoạt động như random-access iterator, với `value_type` là `int` và `difference_type` thường là `std::ptrdiff_t`. Có xử lý tương ứng cho con trỏ tới `const`. Một output iterator có thể định nghĩa nhiều kiểu trong số này là `void`, vì chỉ cần ghi.

Trong template, tên phụ thuộc như `typename std::iterator_traits<It>::value_type` cần `typename` để trình biên dịch hiểu đó là kiểu. Chỉ khai báo `value_type tmp;` khi kiểu đáp ứng yêu cầu default construction; nếu không, có thể khởi tạo từ một giá trị hợp lệ, ví dụ `value_type tmp(*first);` sau khi kiểm tra phạm vi không rỗng.

## 9.5.1 Tag dispatch

Một hàm tổng quát có thể tạo tag từ `iterator_traits<It>::iterator_category` rồi gọi overload phù hợp. Do quan hệ kế thừa của tag, một overload cho `input_iterator_tag` cũng có thể xử lý forward hoặc bidirectional iterator; overload random-access chuyên biệt được chọn khi phù hợp.

Ví dụ sau mô phỏng ý tưởng `distance` của sách. Các overload trợ giúp được khai báo trước lời gọi để việc tìm tên template rõ ràng:

```cpp
#include <cassert>
#include <iterator>
#include <list>
#include <vector>

namespace demo {
template<class It>
typename std::iterator_traits<It>::difference_type
measure_impl(It first, It last, std::input_iterator_tag) {
    typename std::iterator_traits<It>::difference_type count = 0;
    while (first != last) { ++first; ++count; }
    return count;
}

template<class It>
typename std::iterator_traits<It>::difference_type
measure_impl(It first, It last, std::random_access_iterator_tag) {
    return last - first;
}

template<class It>
typename std::iterator_traits<It>::difference_type measure(It first, It last) {
    using Category = typename std::iterator_traits<It>::iterator_category;
    return measure_impl(first, last, Category{});
}
}

int main() {
    std::list<int> linked{1, 2, 3};
    std::vector<int> contiguous{1, 2, 3, 4};
    assert(demo::measure(linked.begin(), linked.end()) == 3);
    assert(demo::measure(contiguous.begin(), contiguous.end()) == 4);
}
```

Overload input tăng từng bước, nên có độ phức tạp tuyến tính; overload random access dùng phép trừ hằng số. Phạm vi phải hợp lệ: với iterator không random access, `last` phải reachable bằng cách tăng từ `first`. Với input iterator một lượt, duyệt qua bản sao có thể tiêu thụ cùng nguồn. Mã thực tế nên dùng `std::distance`; ví dụ này để giải thích cơ chế lựa chọn triển khai.

Đối với iterator tự viết, có thể cung cấp các alias phù hợp hoặc chuyên biệt hóa traits trong các trường hợp được phép. Sách giới thiệu kế thừa `std::iterator` ở phần sau; lớp cơ sở này đã deprecated từ C++17, nên mã mới thường khai báo trực tiếp các alias và đáp ứng concept/legacy requirements cần thiết.
