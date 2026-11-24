---
id: chuong-06-phan-17
title: 'Chương 6 · Exception safety và mở rộng STL'
sidebar_label: '06 · Phần 17: Exception safety và mở rộng STL'
---

# 6.12.2–6.13 · Exception safety và mở rộng STL

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 248–251 (PDF trang 277–280). Các hộp ghi chú là phần bổ sung hoặc làm rõ.

## 6.12.2 Xử lý ngoại lệ

Nhiều lỗi logic như iterator không hợp lệ là vi phạm tiền điều kiện, không được bảo đảm chuyển thành ngoại lệ. Một số API có kiểm tra, ví dụ `at()` có thể ném `std::out_of_range`, hoặc yêu cầu kích thước vượt giới hạn có thể ném `std::length_error`. Ngoài ra còn có ngoại lệ cấp phát như `std::bad_alloc` và ngoại lệ phát ra từ constructor, comparator, hash hoặc thao tác do người dùng cung cấp. Danh sách ví dụ này không phải danh sách đầy đủ mọi ngoại lệ có thể xảy ra.

Sách kể lại quá trình chuẩn hóa C++98: việc quy định trạng thái container khi có ngoại lệ phải cân bằng giữa khả năng phục hồi và chi phí. Ví dụ, chèn vào giữa vector có thể phải di chuyển nhiều phần tử; nếu một phép chuyển ném ngoại lệ, việc khôi phục toàn bộ trạng thái cũ không phải lúc nào cũng rẻ hoặc khả thi. Những bảo đảm exception safety được đưa vào để cho phép xử lý lỗi và unwind có ý nghĩa.

### Các mức bảo đảm

- **Basic guarantee:** tài nguyên và invariant được duy trì theo hợp đồng, nhưng giá trị có thể đã thay đổi.
- **Strong guarantee:** thao tác thành công hoàn toàn hoặc không có tác động được bảo đảm đối với trạng thái được mô tả (*commit or rollback*).
- **No-throw guarantee:** thao tác không để ngoại lệ thoát ra theo hợp đồng tương ứng.

Đây là các mô hình để suy nghĩ; bảo đảm chính xác phải đọc ở **từng overload**, với điều kiện về kiểu phần tử, allocator, comparator/hash và phiên bản chuẩn. Không nên mặc định mọi member cùng tên của mọi container đều có cùng no-throw hoặc strong guarantee.

Sách mô tả xu hướng: thao tác chèn một node vào container dạng node thường có thể đạt bảo đảm mạnh khi điều kiện tương ứng được thỏa; thao tác nhiều phần tử hoặc callable do người dùng cung cấp có thể có ngoại lệ và điều kiện riêng. `list` có các thao tác chuyên biệt như `remove`, `merge`, `sort`, `unique` cần xem hợp đồng riêng. Với vector/deque, việc chèn và di chuyển phần tử có thể làm bảo đảm phụ thuộc copy/move constructor và loại ngoại lệ. Sách nhấn mạnh destructor không nên để ngoại lệ thoát ra trong quá trình dọn dẹp.

:::warning Không suy rộng từ bảng tóm lược
Một số câu trong sách nói chung rằng mọi thao tác container với copy không ném đều có strong guarantee, hoặc mọi `erase`/`swap` đều không ném. Các phát biểu đó quá rộng để dùng như hợp đồng cho mọi container, comparator, allocator và overload. Ví dụ, `vector::push_back` có điều kiện riêng khi move của kiểu không copy được có thể ném; `erase(key)` của associative container có thể gọi comparator/hash. Hãy kiểm tra đặc tả API cụ thể.
:::

### Ý tưởng copy và rollback

Sách minh họa một wrapper tạo bản sao container, thử thay đổi container gốc và swap bản sao trở lại nếu có lỗi. Việc sao chép có thể tốn kém; rollback cũng chỉ an toàn nếu `swap` hợp lệ và không ném trong ngữ cảnh đó. Ngoài ra, khi swap sau lỗi, iterator và tham chiếu của bên gọi có thể không còn mang ý nghĩa như trước. Nếu muốn sửa **bản sao trước** rồi commit, không được dùng iterator `pos` của container gốc với bản sao: phải tính lại vị trí hợp lệ trong bản sao, và việc tính đó tùy loại container. Không coi ví dụ wrapper tổng quát là một bảo đảm mạnh cho mọi kiểu.

Ví dụ bổ sung dưới đây giới hạn bài toán vào `vector<int>` với allocator mặc định. Hàm nhận **chỉ số** thay cho iterator, tạo bản sao rồi chèn vào bản sao; chỉ khi cả hai bước hoàn thành mới swap để commit:

```cpp
#include <cassert>
#include <stdexcept>
#include <vector>

void insertTransactionally(std::vector<int>& values,
                           std::vector<int>::size_type index, int value) {
    if (index > values.size()) throw std::out_of_range("index");
    std::vector<int> copy(values);
    copy.insert(copy.begin() + index, value);
    values.swap(copy);
}

int main() {
    std::vector<int> values{1, 3};
    insertTransactionally(values, 1, 2);
    assert((values == std::vector<int>{1, 2, 3}));
    try {
        insertTransactionally(values, 9, 4);
        assert(false);
    } catch (const std::out_of_range&) {
        assert((values == std::vector<int>{1, 2, 3}));
    }
}
```

Nếu kiểm tra chỉ số, tạo bản sao hoặc chèn vào bản sao thất bại, `values` chưa bị sửa. Với kiểu và allocator cụ thể này, swap dùng để commit; ví dụ không chứng minh swap an toàn cho mọi allocator hoặc mọi container. Sau commit, các iterator và tham chiếu cũ tới phần tử của `values` không còn dùng được: dữ liệu cũ được chuyển sang `copy` rồi bị hủy khi hàm kết thúc. Việc sao chép cả vector cũng có chi phí thời gian và bộ nhớ.

## 6.13 Mở rộng STL

### 6.13.1 Tích hợp kiểu mới

Có thể viết container, iterator, thuật toán hoặc function object riêng để kết hợp với framework, miễn là chúng đáp ứng các yêu cầu mà thành phần dùng đến đòi hỏi. Ý tưởng generic là dựa vào **hành vi và hợp đồng**, không yêu cầu mọi kiểu thừa hưởng một lớp cơ sở chung.

Một lớp giống container có thể cung cấp `begin`, `end` và các tên kiểu phù hợp; nếu không thể sửa lớp gốc, có thể cung cấp wrapper hoặc giao diện iterator bên ngoài. Những cấu trúc như ring buffer cần một cách biểu diễn phạm vi hữu hạn rõ ràng. Không nhất thiết phải đáp ứng toàn bộ yêu cầu của một standard container để dùng được một số thuật toán: chỉ cần đáp ứng các yêu cầu cụ thể của thuật toán đó. Sách nêu `forward_list` không có `size()` và `array` có kích thước cố định như những khác biệt cần xét.

### 6.13.2 Kế thừa từ kiểu STL

Các container chuẩn không được thiết kế làm lớp cơ sở đa hình thông qua public inheritance; đặc biệt không nên xóa một đối tượng dẫn xuất qua con trỏ tới lớp container cơ sở khi destructor cơ sở không ảo. Để bổ sung hành vi, sách khuyên dùng **composition** — lớp của bạn chứa container chuẩn — hoặc private inheritance khi có lý do cụ thể. Composition thường làm quyền sở hữu và giao diện rõ ràng hơn.
