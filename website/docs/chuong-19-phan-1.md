---
id: chuong-19-phan-1
title: 'Chương 19 · Allocator và vùng nhớ chưa khởi tạo'
---

Phần này theo các mục 19.1–19.3, trang 1023–1030 của sách. Allocator là lớp trừu tượng giúp container yêu cầu và giải phóng vùng nhớ theo một chính sách; cấp phát vùng nhớ và tạo đối tượng trong vùng nhớ đó là hai bước khác nhau.

## Dùng allocator với container

Allocator là một tham số template. Với `map`, kiểu phần tử là `pair<const Key, T>`, vì khóa của phần tử không được sửa trực tiếp:

```cpp
std::vector<int, MyAlloc<int>> v;
std::map<int, float, std::less<int>,
         MyAlloc<std::pair<const int, float>>> m;
std::basic_string<char, std::char_traits<char>, MyAlloc<char>> s;

template <typename T>
using Vec = std::vector<T, MyAlloc<T>>;
```

`MyAlloc` ở đây là allocator do người dùng định nghĩa. `get_allocator()` trả về allocator của container. Hai allocator so sánh bằng nhau khi vùng nhớ do một allocator cấp phát có thể được giải phóng qua allocator kia. `std::uses_allocator<T, Alloc>::value` kiểm tra `T` có `allocator_type` và `Alloc` có thể chuyển đổi sang kiểu đó hay không.

Sách còn minh họa đặt tên cho kiểu chuỗi và map dùng allocator riêng. Lưu ý allocator của map phải cấp phát đúng `value_type` của map, tức một `pair` có khóa `const`:

```cpp
using MyString = std::basic_string<char, std::char_traits<char>, MyAlloc<char>>;
using MyMap = std::map<MyString, MyString, std::less<MyString>,
                       MyAlloc<std::pair<const MyString, MyString>>>;
MyMap dictionary;
```

Các khai báo này giả sử đã có định nghĩa `MyAlloc` và các header tương ứng. Việc chọn allocator cho map không tự bảo đảm các chuỗi bên trong dùng cùng *trạng thái* allocator với map; khi cần truyền allocator xuống đối tượng lồng nhau, phải xét cơ chế dành cho allocator lồng nhau.

## Viết allocator

Ví dụ trong sách định nghĩa `value_type`, constructor mặc định, constructor template chuyển từ `MyAlloc<U>`, cùng `allocate`, `deallocate` và các toán tử so sánh. Constructor chuyển kiểu giúp container tạo allocator cho kiểu nội bộ khác, chẳng hạn nút của container. Allocator không có trạng thái trong ví dụ coi mọi specialization là tương đương.

Dưới đây là một phiên bản minh họa có thể biên dịch từ C++11. Nó dùng `std::allocator` để đảm nhiệm cấp phát, kể cả yêu cầu căn chỉnh của `T` theo chuẩn đang dùng:

```cpp
#include <cstddef>
#include <memory>
#include <vector>

template <typename T>
class MyAlloc {
public:
    using value_type = T;

    MyAlloc() noexcept = default;
    template <typename U>
    MyAlloc(const MyAlloc<U>&) noexcept {}

    T* allocate(std::size_t n) {
        std::allocator<T> a;
        return std::allocator_traits<std::allocator<T>>::allocate(a, n);
    }

    void deallocate(T* p, std::size_t n) noexcept {
        std::allocator<T> a;
        std::allocator_traits<std::allocator<T>>::deallocate(a, p, n);
    }
};

template <typename T, typename U>
bool operator==(const MyAlloc<T>&, const MyAlloc<U>&) noexcept {
    return true;
}
template <typename T, typename U>
bool operator!=(const MyAlloc<T>& a, const MyAlloc<U>& b) noexcept {
    return !(a == b);
}

int main() {
    std::vector<int, MyAlloc<int>> values{1, 2, 3};
    return values[1] == 2 ? 0 : 1;
}
```

Khác với ví dụ này, sách minh họa cấp phát trực tiếp bằng `::operator new` và giải phóng bằng `::operator delete`. Ví dụ ở trên vẫn giữ cấu trúc allocator không trạng thái nhưng giao việc cấp phát cho allocator chuẩn; nó không phải một chính sách lưu trữ tùy biến.

`allocate(n)` lấy vùng nhớ cho `n` phần tử nhưng chưa khởi tạo chúng; `deallocate(p, n)` trả vùng nhớ sau khi các đối tượng đã được hủy. Từ C++11, `allocator_traits` cung cấp mặc định cho nhiều thành phần, trong đó có cách tạo và hủy đối tượng nếu allocator không tự cung cấp. Khi tự viết allocator thực tế cần xử lý giới hạn kích thước, lỗi cấp phát và yêu cầu căn chỉnh của kiểu phần tử.

## Góc nhìn người viết container

Một container lưu allocator, con trỏ vùng nhớ, số phần tử đang sống và sức chứa. Để mở rộng vùng nhớ, nó thường cấp phát vùng mới, tạo các phần tử ở đó, hủy phần tử cũ và cuối cùng giải phóng vùng cũ. Ví dụ đơn giản trong sách minh họa trình tự này; triển khai thực tế còn phải xử lý ngoại lệ để dọn dẹp vùng nhớ và các đối tượng đã tạo nếu một bước thất bại.

Trong ví dụ `reserve` của sách (trang 1028–1029), nếu sức chứa yêu cầu không lớn hơn sức chứa hiện tại thì hàm trả về ngay. Nếu cần mở rộng, container cấp phát vùng mới, sao chép các phần tử đang sống sang đó bằng `uninitialized_copy`, hủy các phần tử cũ, trả vùng nhớ cũ rồi cập nhật con trỏ và sức chứa. **Số phần tử không thay đổi**: chỗ trống thêm vào chưa chứa đối tượng `T` được khởi tạo. Ví dụ của sách mang tính minh họa, không phải triển khai đầy đủ an toàn trước ngoại lệ.

Ví dụ sau tách rõ bốn bước với allocator chuẩn: cấp phát vùng nhớ, tạo đối tượng, hủy đối tượng và trả vùng nhớ. Biến `constructed` theo dõi số đối tượng đã tạo thành công để dọn dẹp nếu constructor ném:

```cpp
#include <cassert>
#include <cstddef>
#include <memory>
#include <string>

int main() {
    using Alloc = std::allocator<std::string>;
    using Traits = std::allocator_traits<Alloc>;
    Alloc alloc;
    const std::size_t count = 3;
    std::string* storage = Traits::allocate(alloc, count);
    std::size_t constructed = 0;
    try {
        for (; constructed < count; ++constructed)
            Traits::construct(alloc, storage + constructed, "hello");
        assert(storage[1] == "hello");
    } catch (...) {
        while (constructed > 0) {
            --constructed;
            Traits::destroy(alloc, storage + constructed);
        }
        Traits::deallocate(alloc, storage, count);
        throw;
    }
    while (constructed > 0) {
        --constructed;
        Traits::destroy(alloc, storage + constructed);
    }
    Traits::deallocate(alloc, storage, count);
}
```

Nếu một constructor ném, phần tử đó chưa được tính vào `constructed`; chỉ các đối tượng đã tạo thành công được hủy. Nếu chính `allocate` ném, nó không trả vùng nhớ cho caller và khối xử lý sau đó chưa bắt đầu. Đây là ví dụ về vòng đời, không phải container hoàn chỉnh; trong ứng dụng, RAII và container chuẩn thường giúp quản lý tài nguyên thuận tiện hơn.

Các hàm trong `<memory>` giúp khởi tạo đối tượng trong vùng nhớ chưa khởi tạo:

| Hàm | Công dụng |
| --- | --- |
| `uninitialized_fill` | Khởi tạo một khoảng bằng cùng một giá trị. |
| `uninitialized_fill_n` | Khởi tạo một số phần tử bằng cùng một giá trị. |
| `uninitialized_copy` | Sao chép một khoảng vào vùng nhớ chưa khởi tạo. |
| `uninitialized_copy_n` | Sao chép một số phần tử vào vùng nhớ chưa khởi tạo; có từ C++11. |

Các hàm này tạo đối tượng tại đích, vì vậy đích phải có đủ vùng nhớ chưa dùng cho số phần tử tương ứng và các đối tượng tạo thành công vẫn phải được hủy sau khi dùng. Nếu quá trình tạo phần tử ném ngoại lệ, phiên bản thông thường của các hàm tự hủy những phần tử đích đã tạo trước khi lan truyền ngoại lệ; vùng nhớ nền vẫn do bên cấp phát quản lý. Không dùng chúng để ghi đè lên những đối tượng đang sống như một phép gán thông thường.

Ví dụ sau minh họa `uninitialized_copy` với allocator chuẩn; phần `catch` trả lại vùng nhớ nếu phép sao chép thất bại:

```cpp
#include <cassert>
#include <memory>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> source{"mot", "hai", "ba"};
    std::allocator<std::string> alloc;
    using Traits = std::allocator_traits<decltype(alloc)>;
    const auto count = source.size();
    auto* storage = Traits::allocate(alloc, count);

    try {
        std::uninitialized_copy(source.begin(), source.end(), storage);
    } catch (...) {
        Traits::deallocate(alloc, storage, count);
        throw;
    }

    assert(storage[1] == "hai");
    for (std::size_t i = count; i > 0; --i)
        Traits::destroy(alloc, storage + i - 1);
    Traits::deallocate(alloc, storage, count);
}
```

Ví dụ dùng `std::allocator` và không minh họa các hook tạo đối tượng riêng của một allocator tùy biến. Một container hỗ trợ allocator tổng quát cần cân nhắc `allocator_traits` và các yêu cầu allocator tương ứng, thay vì mặc nhiên thay mọi lời gọi `construct` bằng `uninitialized_copy`.

Sách cũng giới thiệu `raw_storage_iterator` để thuật toán ghi vào vùng nhớ chưa khởi tạo, và cặp `get_temporary_buffer` / `return_temporary_buffer` cho vùng nhớ tạm. Bộ đệm trả về có thể nhỏ hơn số phần tử yêu cầu nên phải kiểm tra kích thước và giải phóng đúng cách, kể cả khi không đủ bộ nhớ. Viết mã an toàn trước ngoại lệ với cặp hàm này khá phức tạp.

### Iterator và bộ đệm tạm trong ví dụ lịch sử

Ở trang 1029, sách minh họa cách dùng thuật toán `copy` để **tạo** các đối tượng tại đích chưa khởi tạo, thông qua `raw_storage_iterator`:

```cpp
// C++11: minh họa biểu thức trong sách; storage phải có đủ vùng nhớ phù hợp
std::copy(source.begin(), source.end(),
          std::raw_storage_iterator<T*, T>(storage));
```

Tham số template đầu là kiểu output iterator trỏ vào vùng nhớ, ở đây là `T*`; tham số thứ hai là kiểu phần tử cần tạo. Đây chỉ là mảnh minh họa: caller vẫn phải quản lý cấp phát, hủy các đối tượng đã tạo và giải phóng vùng nhớ. Đặc biệt, nếu thao tác tạo một phần tử ném ngoại lệ, cần có cách theo dõi và dọn dẹp những đối tượng đã tạo thành công; không giả định lời gọi `copy` tự làm toàn bộ việc đó.

Với `get_temporary_buffer<T>(n)`, kết quả là cặp gồm con trỏ và số **phần tử** thực sự được cấp chỗ. Sách phân biệt trường hợp số lượng bằng 0 với trường hợp nhỏ hơn `n`: ngay cả khi không đủ cho yêu cầu ban đầu, vùng nhớ đã nhận vẫn cần được trả bằng `return_temporary_buffer`. Vùng nhớ đó chưa tự chứa các đối tượng `T` đã khởi tạo; việc tạo và hủy đối tượng là trách nhiệm riêng của caller.

Đây là các tiện ích lịch sử: `raw_storage_iterator` và `get_temporary_buffer` bị đánh dấu lỗi thời trong C++17; `raw_storage_iterator` và API bộ đệm tạm bị loại khỏi chuẩn C++20. Xem [ghi chú tương thích trong bản dự thảo chuẩn](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf) và [tổng hợp thay đổi C++17](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/p0636r0.html). Khi viết mã mới, hãy chọn cơ chế quản lý vùng nhớ và vòng đời phù hợp với phiên bản C++ đang dùng.
