---
id: chuong-09-phan-7
title: 'Chương 9 · Tự viết insert iterator'
sidebar_label: '09 · Phần 7: Tự viết iterator'
---

# 9.6 · Tự viết insert iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 471–474 (PDF trang 500–503). Ví dụ giữ ý tưởng sách và khai báo alias trực tiếp để không phụ thuộc lớp cơ sở deprecated.

Sách xây dựng một output iterator cho associative và unordered container. Khác với `std::inserter`, adapter này gọi `container.insert(value)` mà không truyền hint. Nó không tự lưu một vị trí phần tử: mỗi phép ghi gửi giá trị cho container, còn container quyết định có chèn và đặt ở đâu.

Trong sách, lớp kế thừa `std::iterator` để có các alias iterator traits. Cách đó phản ánh C++11; `std::iterator` đã bị deprecated từ C++17. Ví dụ dưới khai báo alias trực tiếp:

Để `std::iterator_traits<MyIterator>` có thể cung cấp thông tin cho mã tổng quát, sách nêu hai hướng: khai báo các tên kiểu cần thiết bên trong iterator, hoặc cung cấp specialization phù hợp của `iterator_traits` cho kiểu iterator do mình định nghĩa. Cách thứ nhất thường thuận tiện hơn khi ta thiết kế chính lớp iterator đó.

Với cách viết lịch sử `std::iterator<Category, T, Distance, Pointer, Reference>`, hai đối số đầu chỉ nhóm iterator và kiểu phần tử; ba đối số sau mặc định lần lượt là `std::ptrdiff_t`, `T*` và `T&`. Đây là lớp cung cấp tên kiểu, không tự triển khai phép dereference, tăng hay gán cho iterator. Ví dụ dưới chọn `void` cho các kiểu không cần thiết của output iterator và tự viết các phép toán.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <unordered_set>
#include <vector>

template<class Container>
class asso_insert_iterator {
    Container* container_;
public:
    using iterator_category = std::output_iterator_tag;
    using value_type = void;
    using difference_type = void;
    using pointer = void;
    using reference = void;

    explicit asso_insert_iterator(Container& container) : container_(&container) {}

    asso_insert_iterator& operator=(const typename Container::value_type& value) {
        container_->insert(value);
        return *this;
    }
    asso_insert_iterator& operator*() { return *this; }
    asso_insert_iterator& operator++() { return *this; }
    asso_insert_iterator operator++(int) { return *this; }
};

template<class Container>
asso_insert_iterator<Container> asso_inserter(Container& container) {
    return asso_insert_iterator<Container>(container);
}

int main() {
    std::unordered_set<int> values;
    auto out = asso_inserter(values);
    *out = 1; out++;
    *out = 2; out++;
    *out = 3;
    *asso_inserter(values) = 44;
    *asso_inserter(values) = 55;
    std::vector<int> input{33, 67, -4, 13, 5, 2};
    std::copy(input.begin(), input.end(), asso_inserter(values));
    assert(values.size() == 10 && values.count(2) == 1 && values.count(-4) == 1);
}
```

`operator*` và `operator++` không di chuyển trong container; `operator=` gọi `insert`. Hàm `asso_inserter` suy ra kiểu container và tạo adapter thuận tiện cho `std::copy`. Dùng `*out = value` theo giao diện output iterator dù một số adapter cũng cho phép gán trực tiếp vào đối tượng.

Dữ liệu cuối có mười giá trị khác nhau: `-4, 1, 2, 3, 5, 13, 33, 44, 55, 67`. Thứ tự duyệt của `unordered_set` không được bảo đảm. Có thể đổi sang `std::set<int>` và include `<set>`; khi đó các giá trị được duyệt theo comparator. Container phải tồn tại lâu hơn mọi adapter dùng nó và phải có overload `insert(value)` phù hợp.

Ví dụ này minh họa giao diện legacy output iterator cho các giá trị copy được; nó chưa phải một adapter tổng quát cho mọi kiểu chỉ move hoặc mọi C++20 ranges concept. Khi cần các trường hợp đó, phải thiết kế thêm overload và kiểm tra các yêu cầu tương ứng. Việc bỏ hint có thể ảnh hưởng hiệu năng theo dữ liệu và implementation, không bảo đảm tốt hơn `std::inserter` trong mọi trường hợp.
