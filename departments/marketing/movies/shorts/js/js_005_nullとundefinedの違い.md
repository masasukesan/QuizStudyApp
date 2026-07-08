# 動画タイトル
nullとundefinedって何が違うの？【JavaScript基礎】

# 説明文
nullとundefined、どっちも「何もない」に見えて混乱したことはありませんか。実はこの2つには明確な違いがあります。プログラミング初心者・挫折した方向けの60秒解説です。

# 台本

nullとundefinedって
何が違うの？

同じ「何もない」に見えて
実は違うものなんです

結論から言います
undefinedはまだ値が入っていない状態
nullは意図的に空にした状態
それだけです

例えばこう書くと
let name;
console.log(name);

これはundefinedになります
まだ何も入れていないので
JavaScriptが自動でそうします

でもこう書くと
let name = null;

これはnullです
「今は空にしたい」と
自分で決めた印です

つまり
undefinedは入れ忘れ
nullはわざと空にした
その違いだけです

これさえ分かれば
コードを読むときに迷わなくなります
