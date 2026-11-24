---
id: chuong-07-phan-21
title: 'Chương 7 · Chọn container phù hợp'
sidebar_label: '07 · Phần 21: Chọn container'
---

# 7.12 · Khi nào dùng container nào?

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 392–395 (PDF trang 421–424). Bảng dưới trình bày lại bảng 7.57 và làm rõ một số giới hạn.

Không có container nhanh nhất cho mọi bài toán. Số phần tử, cách truy cập, chi phí tạo phần tử, cache, allocator, tần suất thay đổi và yêu cầu ổn định iterator đều ảnh hưởng. Với tập dữ liệu nhỏ, duyệt tuyến tính một vùng nhớ liên tục có thể nhanh hơn cấu trúc có độ phức tạp tìm kiếm tốt hơn nhưng chi phí cố định lớn.

## So sánh các nhóm

| Container | Tổ chức thường gặp và khả năng chính | Iterator | Khi nào đáng cân nhắc |
|:---|:---|:---|:---|
| `array` | Mảng kích thước cố định; truy cập theo chỉ số; cho phép trùng. | Random access | Biết kích thước lúc biên dịch và không cần thay đổi số phần tử. |
| `vector` | Mảng động liên tục với phần tử thông thường; thêm cuối hiệu quả; truy cập theo chỉ số. | Random access | Điểm khởi đầu tốt cho nhiều dãy dữ liệu. |
| `deque` | Thường dùng các khối; thêm/xóa hiệu quả ở cả hai đầu; có truy cập theo chỉ số. | Random access | Hàng đợi hai đầu và các bài toán cần sửa thường xuyên ở hai đầu. |
| `list` | Thường là danh sách liên kết kép; chèn/xóa tại iterator đã biết. | Bidirectional | Di chuyển nút giữa list hoặc giữ iterator tới các phần tử không bị xóa. |
| `forward_list` | Thường là danh sách liên kết đơn; không có `size()` hoặc truy cập trực tiếp cuối. | Forward | Cần danh sách đơn gọn với các thao tác sau vị trí đã biết. |
| `set`, `multiset`, `map`, `multimap` | Thường là cây cân bằng, duy trì thứ tự theo comparator; chỉ nhóm `multi` cho phép khóa tương đương lặp. | Bidirectional | Tra cứu theo khóa và cần duyệt theo thứ tự hoặc tìm cận. |
| Bốn `unordered_*` tương ứng | Bảng băm; chỉ nhóm `multi` cho phép khóa tương đương lặp. | Ít nhất forward | Tra cứu theo khóa khi không cần thứ tự và có hash/predicate phù hợp. |

Các cấu trúc bên trong là mô hình thường gặp, không phải yêu cầu về representation của chuẩn. Tìm kiếm trong dãy thường tuyến tính; tìm theo khóa của associative container có thứ tự là logarithmic; tra cứu unordered thường hằng số trung bình nhưng có thể tuyến tính trong trường hợp xấu. Unordered container **không** cung cấp random-access iterator, dù sách dùng chữ “almost” khi so sánh khả năng tra cứu.

### Những điều cần cân nhắc

- `vector` có thể dành chỗ bằng `reserve`. Reallocation làm mất hiệu lực mọi iterator, tham chiếu và con trỏ tới phần tử; kể cả khi không reallocate, chèn/xóa có thể làm mất hiệu lực từ vị trí thay đổi trở đi.
- `deque` không có `reserve`. Khi chèn ở hai đầu, tham chiếu tới các phần tử cũ còn hợp lệ nhưng iterator bị mất hiệu lực; xóa hoặc chèn ở vị trí khác có các quy tắc riêng. Không thể áp dụng bảng tóm tắt “luôn mất hiệu lực mọi thứ” một cách máy móc.
- `list` và `forward_list` giữ iterator/tham chiếu tới phần tử không bị xóa qua các thao tác chèn/xóa thông thường. Chèn hoặc xóa một nút tại vị trí đã biết là hằng số; tìm vị trí trước đó có thể tuyến tính. `splice` một phạm vi giữa hai list có thể tuyến tính theo số phần tử được chuyển.
- Rehash ở unordered container làm iterator mất hiệu lực, nhưng tham chiếu và con trỏ tới phần tử còn tồn tại vẫn hợp lệ. `reserve` và `rehash` cho phép điều chỉnh bucket; xóa phần tử không bảo đảm trả bộ nhớ về hệ điều hành.
- Xóa một phần tử hủy phần tử đó, nhưng không nên suy ra rằng bộ nhớ lập tức được trả về hệ điều hành. Sách gợi ý deque có thể thu nhỏ vùng nhớ khi xóa; chuẩn không bảo đảm việc này. Với vector, `shrink_to_fit()` chỉ là yêu cầu không ràng buộc.
- Bảo đảm ngoại lệ phụ thuộc thao tác cụ thể, kiểu phần tử, comparator/hash, allocator và phiên bản chuẩn. Một số thao tác chèn một phần tử có bảo đảm thành công hoặc không tác động; không thể kết luận mọi thao tác của một container đều có bảo đảm mạnh.

Sách gợi ý dùng `vector` làm mặc định khi chưa có yêu cầu đặc biệt, `deque` cho thao tác ở hai đầu, và xem xét `list` khi cần chuyển hoặc xóa tại vị trí đã biết. Dùng (multi)set khi cần giá trị được sắp, (multi)map cho cặp khóa–giá trị; chọn biến thể unordered nếu không cần thứ tự và hash phù hợp. Đây là điểm xuất phát để đo, không phải luật tuyệt đối.

Nếu cần nhiều cách tra cứu hoặc sắp xếp cùng đối tượng, có thể duy trì nhiều chỉ mục và chia sẻ đối tượng như phần 7.11. Phải quản lý nhất quán các chỉ mục khi dữ liệu thay đổi.

## So sánh hai cách sắp xếp và loại trùng

Sách đưa hai chương trình đọc các từ từ đầu vào chuẩn và in các từ duy nhất theo thứ tự. Cách thứ nhất chèn vào `set`:

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <set>
#include <string>

int main() {
    std::set<std::string> words((std::istream_iterator<std::string>(std::cin)),
                                std::istream_iterator<std::string>());
    std::copy(words.cbegin(), words.cend(),
              std::ostream_iterator<std::string>(std::cout, "\n"));
}
```

Cách thứ hai đưa vào `vector`, sắp xếp một lần, sau đó dùng `unique_copy` bỏ qua các giá trị trùng liền kề khi in:

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> words((std::istream_iterator<std::string>(std::cin)),
                                   std::istream_iterator<std::string>());
    std::sort(words.begin(), words.end());
    std::unique_copy(words.cbegin(), words.cend(),
                     std::ostream_iterator<std::string>(std::cout, "\n"));
}
```

Với đầu vào `cam tao cam buoi`, cả hai in `buoi`, `cam`, `tao`, mỗi từ một dòng. `unique_copy` chỉ bỏ qua các phần tử bằng nhau **liền kề**; bước sort trước đó làm các từ bằng nhau nằm cạnh nhau. Khởi tạo iterator đầu vào có thêm dấu ngoặc để tránh bị phân tích nhầm thành khai báo hàm.

Sách kể một phép đo cũ với khoảng 350.000 chuỗi: trên một hệ thống cách vector nhanh hơn khoảng 10%, thêm `reserve` nhanh hơn khoảng 5%, và biến thể cho phép trùng nhanh hơn 40%; trên hệ thống khác, vector có thể chậm hơn tới 50%. Đây là số liệu minh họa của tác giả cho những môi trường cụ thể, không phải dự đoán hiệu năng hiện tại. Hãy benchmark các phương án với dữ liệu và hệ thống thực tế.
