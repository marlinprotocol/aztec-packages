import {Test} from "forge-std/Test.sol";
import {BlakeHonkVerifier} from "../../src/honk/instance/BlakeHonk.sol";
import {BlakeOptHonkVerifier} from "../../src/honk/optimised/blake-opt.sol";

import "forge-std/console.sol";

contract BlakeOptTest is Test {
    // The base proof, without the public inputs

    bytes proof =
    hex"00000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000048A7D18CE712399825CFB40CD180D9D27E000000000000000000000000000000000021CD98351CCDC38890C0CB417BDDB3000000000000000000000000000000FED4E368E3185871FB3474CADA373761DE000000000000000000000000000000000021661929D7E463717A20655B7AF9BC000000000000000000000000000000B6F5D9DC03CF38C047D6165FF8C2C781D9000000000000000000000000000000000020176EF436F35AC608C0677982810C00000000000000000000000000000078491612A313CFFE291A4E834C39DEB9BD000000000000000000000000000000000011DC5E934EB0A1E74F8050C3C60DDA00000000000000000000000000000019DAF11B0607A0C5C30F574EB80CC2554600000000000000000000000000000000002CFC2EC0AE3B7ABFAB7C5182DFD317000000000000000000000000000000ADF632A35D955E9DA39783DBBE6FD98DA4000000000000000000000000000000000012B71E269C0A3A524BDE68DA168E40000000000000000000000000000000234F6784B7B0E4EBD2787C20125D5AF84500000000000000000000000000000000001326B11934E0018CBA4E8FFF3BBA3D000000000000000000000000000000655693C82A2D9F5E98FFE667B97475923400000000000000000000000000000000000F7C70310555CE93AD2C380C593A0900000000000000000000000000000036AC69F7F7D3E8DBE49400ACB9393B3A6800000000000000000000000000000000001552B0BE75FD4F74CA4254039FDEE4000000000000000000000000000000328F5DDF4DBC9DF00C72ACDB59B8210FB4000000000000000000000000000000000002AC50C5F14C1F469B4FBC0EE0AD91000000000000000000000000000000D9883290A5980A215A1724CAC64BE74F010000000000000000000000000000000000247045838549349E2BC4F9E46220B50000000000000000000000000000007DF070F2CEA4CB683011E1074C0D66EB87000000000000000000000000000000000006A6DDAD0316B9018BDA6482D2573B00000000000000000000000000000016006D816CBC999594E21BE0DC613C5274000000000000000000000000000000000021AF905EADE2B71129C1DD1DF6AC8200000000000000000000000000000029067CE14C0776EAEBBDF1942EA1BF955B00000000000000000000000000000000002FAE43C693AD80A0D41C1BADE794A4000000000000000000000000000000B336D49B3907B3290D430FC1CFBC9FEC6E00000000000000000000000000000000002E7A45FBAB6B7078996924D150EEA1000000000000000000000000000000F9484A9699E802A97C334D0AB7B66334CE00000000000000000000000000000000001F81242AF902BBF9667C20AF82411700B8E61B58199893E653318F81C972B030E5BE88FA17577E71D387D2052DFE752FAB685789180795D1FD1426FFB7E5ACF74E29BF7FA21912D20E6DC1EAD2018C20684A2A70435AB52A734E978123EBFD8F1F344ECEEB3655056308880E71142E001C6A3501D4686BC2FBD90A7580E1CF9944724817BB78EFF01D27F7D8F64C8A290DB26FEA93E76D2401A048F84890D03665A05048CA14D6768A2527012D5C4123A67ADF897DE12809A3D9879437CF4DC8922D2DB79E49D377D4F18AB5D3089B1D0A46E90ABEFB8FB4EEDF5DD86EB85AE23BEEE207CB742C638FBEA8D8CE68DF14211A1F6A942683683FA187D45AB36E06AE82A81F3F49BFD98152CEAF9F99CC037659EA45F2F5B532ED2393D7953893A88089BA4D05F45E09B13725F7E44065287E1FE5D3044544D3805241B0026ADD91F0701147CA7785FBB2D480530F310504A812E3821DB34912485E2125D83E26035428FAB33801F669F3DD8401D3FFC9098CBE68D4E0CF2B8558F4580AAC2DE233ACC66957BC258F55ABB08B08989D9C1EB78D57BA2C0443A26CC332D71A18B1D9065C86C683262BF0F5C69D00A4FB980CF0A142421677706889B5847DAB25626476DFF25B75CFFC52CE056FBE96294B1BD9272DB7482E667AA8B32DE3653CA3A95F0CF3E78DD4EE097F614286B193CE1687BED2B684CBC3E526AB4886C415D125F13096CF0A1F4009B1AA6D8C4D59152DE9E877AB3E3BFD242DDF7596426B3BFD5D75378F6A3C9AE66DD058DDACB66712376D7D30411C69DE56277411B37FF74C4244AF09685D2AB00728CA5108D1DF276B321C4E05058A9255F9A4FC713BFEA178832997410CB938CFCE6371A728C2297E027859374E5D05E6DCE9A6BEA6A1B0BECE4AADBF8798779B7EF2318136FA2B8478FE29C23208983E9AC368EB38C78D17FEC81BC3424BE68AD185A66DB33D283B26C73C8FCDFDC63464C460F8E643944F0715239743ADE54C2109CA1CC36E1437D214A6262D974F6AF8B9070D063CE9CC04E9CA39EBA4324DCB7AAE2C49E518339576CF05F4F85A252883437A5099B1924551A2CFF68EF114841E0ED03E2E0C058649E3D08962B973F032466710676E44B9E5CA9BF1A6B74FCC1535CCAAD80082F724807573A8D8E26EEDE5B07C45CE36E649B6F2E4024928A318D9B3332B0E4445ED89665AF33F8EDF108444035E672974DE5F6A19E0BDCC274022892888214D4DDF92B05B00638F76DBB65358E770815BB07DA9F56B9B09CBAC68A107B029DA81C034B93247C0AD4188BB589982939E0A190F7BE22763B3E450EEC7D9FD1CD8681CB84DE3BD794F96E32C78DB1F5CA5877FEE874423B96C58B4E47E9B3B20AD8F6B62355E31FD671934FD320628E5940C299870E0A372E4FCA2C1FFEEE30EF6B69937B9CAD10BA9E3F71EA12B16255F5890A6245D5F782DF0D3D5279A8322BD6A9624364D328D3B1752FC69938B385D9245C9971519AAC533C1E61CF49208BDC0BF003FFFBE8747EC75B6EA3533651A1A193E4D5A97DB0C48F485CEAF4209F99EEFAB95EBB07DD1B9853B5E9CDC4DFAFE007254931159C163FE3FD8172C2CAEE447B3188A2AA0628B647AF7CE4B72244E74AA2DC8D30E0A61A55D401F491DD669160D372080CCB611EA3986655813E0146575BF2B792CA9BD0A7743B765074347D60B3A0C2C6D22B0A73A1DE35AA3D8F29EC41CCC55EBDCB19FFD71FF06297D78DEA14B293562CB5A0C86B2E42F0F694D24FEE90F7F10B4B04388B1C94B15328AB8C5767451B0C48552A27256DC39673527D415A6453351697BD58F61D60EF9C8862E07FE33F4C31BAA264C45B7C8312A1B380905C7C49CF9B249CDC0812B5AF215CAC0830C2FCE3D186707C4D0F1959B4F175F550DF604A51661B4868D297300CE3AD5AEDC4D3B6535834CD55C4812B2E001334500E2A9BB9EF3AF6B47106E243E92EAC29D90758C59F9A96F381FF528CC32DA8502AE0B64EAC78467092E9A48AADE85E9CA890BC72A3C1DB23741DF929E5F1E2B8F44195E35DBDE4865139F9FE8CC9B64DD5A37CE09FED0B071600FF60D19E2788809B78EB9DAFB52910044BFB4D8CD566B9EC7150103413023A02A7D2335D3D5ECFE6AE8089B006E3C1A464AFEE8925A4A9A6438B9F6F3B750E414F3A5329E86F8530BAEEFD31350F91848118319D37E726AF6D6B89C27CABD95C382AA999D3059B3561FB20ABB3ABB25B01A4F286C23F01F253FA2E35D85CF50E2D0121DC77F2537D012E7F450B1D726FEEE196164848D64C1B6887EB26863AC9B34BFF52E3801E19B6F636410CB9024EC490C3582B4A8C2BEFF1BD578CFC1102CBDDC6243782C90D4F0EBB1D24B5506FF0E865EA5FF56B675C0444C5F99A5939B2279329A5263B3CA4AB4778CA17A272943F046234444D1DAFBE2AF8393E241F89D0ADBDCD8B1B5168DFA4338B19A1B0670B185E3650DE08F16593B9C4B63C6019A99CCE67C18F917E9CD085647620C0C5D32AB8AE3B7BF472082F8C51F0BC7419450CF4935D0B1A4DF1137D2297E039745B55D2F64411A2D0B6CFAD956FDA9EEE1B3CDC3779CBC0A1053F201D2541DCB454EE033C2D5190FFAB5D3034DF2F84C703C52026A65634A5CB17D93F14B023223996FBB60FDEC7F2B1AEC1A7453615E77BB74517CBE1316CDAD94B8A1D017718AEECCD78FEF11F9224083FE8BECDC982C1AE6D9B067841682565CFEC312072E68370796CDEE0D766A120ECEDDD17AC56351535AC70AC1237D7AC5D914C20E038A674D28BB8028CAF3EB18FA868686FCA24633760AF581538CC9E1B7139908E9C011B2E92592B18D907B686C037EB0DF5C5EE96F83C4308F920DAD4757AB23FFCCD1B459B6D12D9C2D13A587A423AABABD2CB16DA836AC71C672B54F64A103A39C574894CC925267A977E86F72F0FB88DB760EF49AA4B3AEC55B694EA6A71A7765A58882F7F906E6A1EF55FAE742172866CE29E4AD627B0D770F457C708311AD952904E358D8D8577649493EEF8F6ACBF5610133C568C96F82B04142E2950F68028ADA72D90216B0F3417DD64FB05C6A545A4D59C99A193C5296B07A1FBB29803F7FB6A94C6EC188597385D7C9625921B2288A43CE3D1784B17F6DA5B81E21AD42A1ADFE17B661E2063A8035B268B0E25D19D80251AF1023D7C3DB32094A1E96032D369C13F99957CAE4EF63F80329291E40D482EE9252E3459DEF9048BD00C9F7AE4E41E17817694F16B13FB4E3C0BCE5F6B7580D4CBBDFF2AD442024A52385E667D2CF671DDEA153684E944651879A5A7B910F94F013DE25B48530C8A8232317438D3D3C53BA08F8D390EAB0DBC6CDF09730193CFAC83D9F41B037F68F155A2E3BB557CCDA5A3AF6FF71300864BA0F14FE50FEEF015D8ED8A0697E7DF21E91D5527F8741C165D4E2E7686B74EABD061C96F93151067D9D3D743E5CE50205E5836118CBE9C7C2FD8544DA890D18FD854BA624855459ABE9C32A1AE4B73D1B27C0C90B8A9E3E48DFF6CF1F45ED19A4802153F6C1EB8A2EEF5A1536E569891932B8443AC3C45007A81CB33BC9E88359CFCC762AD3F52EECF60A4AEC4DAB2A23FB5DA0429DDFF20BFBAE5F52AE3F9959789984CF9A1B066E5981FB2AE00BD92F4FB3A346E76E8B8D9E9686792F26E172B9DD7DC16AF0D43F3A9357F29C89160D8009C3AF5564E0EBF157F2FC12C648EE2484A4DBC185625EBB487CD348A85C16044AE36F191C77BD1B2CD842B815A199757606D40C620A8380823E971C492109FCE6AFFB23E01015602EDE0665C627BE6FD7A9A6792E9672985B5E57344DD004F85F617219CA3840E09B6DCC0B7AC1852DE9DD8A422F11CAD9EB54EA29499122D0E152333086F761DAAB64068752B3871F418D9C029C3889AFE2FB325DB88912F40763FC90950B744566EBE1FA186B1767F7B7A1D0398DAAA40681E33445F51E1417E5CAF625DD9BACAA951221515220C17A6252FBC2F9925BA31CD8CCA23B29EF1482C638845CE92E35B7308E2AB513452B74F4F1674922CF182E4E402D4503CDC9494AB4F97E7AB0FB12FD3E122579DFEF559A8904278249A72553B3E1FE17F20CEB9A62706199FB5E92CFA5CA2278E28FE3F2F7518236100B7B58EBB5D725C37E4ED9C8948688DF6412AE9CDA20A45B0499FBBB335339BDDF6A878B8360091E3632EF4BFAA016979CBAA3BA8FF275F14A3C64CCA1185236C6F20E5058141F181C3CAEB05CCABC57671867F7442FAB7D8C88D71733CDF5908741D0A3BCED17E24C215F2A83BE60E1790591C6206D5D7E8A30ABCD852CEADB2E596BC330DA0FC90C06BE7EAF56ED66D2E9EB96E0D2E3FFBF985D08D7B559C8492DE7D84C9F1764E3476E332EA11912D1EDC5EAAA792C4BFDF44A990A0E34DC88DDC4517B9627DC7D90D6C81E65003064636AC0E35224020A9B2026607C8FE9D9F7FDA76B060077254E44E2A32A4CEA03B3490F6E966734A86CA424EEF554D9951655F3062B218256B95C69A079FB1A1F286FF949CB30A5785D4829189291D9330C0567406921992640E74093E9B9A382B13E54E9C0599F0C1C8C6715664F263A50A5EF9027035C6D04204344E07688BA79F15A25708200C326AFFF3C017290843C96D3ED342D5929E21363EF64CCE488E9DCCD0D7E318486FD63E2B6E0D1B7F63AF8FED872119091A333B824BF5ED6C711C0FB1896EC6E1A89F7032E133561973CC37E2BCA0B613C18FA38588CF6DDE1DE955DBA5E340475BE433A8709F4C45D943B8709801A10593F9D106220F46E6724722B31000FF19C8B203E0A1E32F7F1B9439BB9D22F32183C98799F1D2FEDDD285E73AC2D630F8D3A8DEA5F450559C6AF8902814C04C93312A859E3F82093C38CA1425EE04D006AB11F7E6C87E22DADE0B1EF2BB7047EA35893A1B797D41299DAA2BE691890F38C2A10374450520F83F1A3D21A04147C11EA15DDF41F4B5CE97283B1DBDD44C80BAE018C16FF020BAC03462CC25027051049BBA632E03BF036AF771CAD0711D2979D3D0A373B7665E7F04504CAF905C047996F3EDAC08E34CCE97F27046FE46473172E679300C4461323034D211727724596D21BC211E313E7A9A462EACB51F7378C6D9C001CC85F61EFEA7B5FB711690F5437BDC5B439ED07A6FD6E9A14FC7425627963DF7119365C492129D1A117FD2B3B76F980F85D3C8C11A9DF6720D3E1241AC640C0C0FE39BF9B47474A5702C4644B3AA14312074F41F61504E9E1291149050714E61E59AFEB376296D7730D2F202B550C11A495764B30BFC3BD62FCE2942E5F067438D7D25486437DA1961D805789A7432A8C8D1643C0930BB2A626CD1DF3E58FFEB48DECBE035E0F10652A845FA234AB9FADF190B02B1262F3575F8AD43B89990D268E9BDBC547525A21291B134D16E81FADA18BFF8BBCE000412D8DB7AC2B6112F65C54FC3DD9353EE7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FB55CB12EE8B51E19C6BE590AD7838ABB4A42A02B3B241386AA8C2D62A14BC2221BF2EFC73AB6D71D1592E2CC6DBF3FD8666A0880EBA9B23B272E24465D759208853B518D42171DA6A4DBEDF815D6ACD648BF263ADFD924D6F81454A8136D5416F04F72788F02256D43678197B7917FBC516BAA71CCB9E6861AAE5C4A48547500C525F26A0716D1D5E02561150C83DD60126CAF0FDE6AB1C8D7518BA11B40AD23C2B1EAB1B990134834A6C544955E06C91716A33CB57C968500A02D6A2970DF2330793863C1DA938188C0E5A219507622A73E7120A27013288E68645BEF70B326124DA926B9AC40A8FEF05DD96550966E946B6B9C541441F3BAE57EB044939825AE459813D6BF051F7A63716E826492B4D04EBA086D341434112731F6E268F21DD01C2F32816B0CB7B65248996582BAEDA8DB5FFA9217BA9C106E2FB3D225161CA0FCAB818619B0CCDB3060C7B186D89BB846697D6B081C90DA5E6673DE11CD1520EEAB9747DE29E84519E23583370E2B3E44D6C505FE0CB3D9028BE08964CA004CDCE24681F0FFDAF12180D9E610C7818D2614AB462A7B5CD8222F2E26DC5B0C156D39477F3BE7D22BB593FB28B414260BFA74D43A56228D1E1404CDA012542568E79723C116B9720607F1F911F77551BE57EDF7913B5FF076ECDBC4D16B121D93DCFC5DFC299CB45F43BF66EC84A568136E5CBF05E72ADB5371560AF19B330AA5A243C70F2C75F1DFF03D4ED4F743FE239606B381D6D4A80D7DE44BE148742F1BD60B5785B92AFF68163039965D258607CD5C3259C059801D7C69B51DAA432BD5F5AAC52FDE2F8FF6DBD84D80288DE50DCBCAA04041775298E24D4BF60C35105DD397A38F94CFB3E19B7168AE43C7CA8953F3CB428A8BCF311D85906CE3670BE6610333FF6EC1B9AFC3CA034D87EE7770016BAAC0601108709C1B64B411FA245683A114925A35BE66E8D7710C527CD7842ABB0F4A3C1FB1CC4E0083BF09E31F0C969CB73BB275844F2819F17AD24E03821538A3213AF8104C166A46326A092D9E605064AAB127555C8F7A714090FB9E3D4BD1FC668FA45C84D20D7CC9513D0FE0FCF092D7C087148B7CCF9A89D7A96BBBFDA85FCDACB42FD8B0FB6F8B6ACD08F2A51909B57015E7F22615152A0E0E6418FB5730298A4A3D20A49BA7F6C7A7173AF17C423CA177FB83C81DDD11F6EC7CDD2B5EB9814B87830EBD3936D0E4F9119D602F577EC3A299C6419F60183E663EBD37154C77BDF8ACECF4A674DE6F93294CCFFCDA8E827D06A164264408615BAA0B43958F5AD4450A22580AF81BFB8506337806EA715E8FFB0B619C43C49FC40E6C2CBD53D74B9B547B6DC04567B0E105EF5C23727F9867A752CDF4D566E9A182DCDE7BA79FE7AEB959B349D4629605139ABED96C125903EE00ECF3F51190132E9D7DEB7C6ABC5632FF21675E35C57F198B70FAF7DB28F3BDF16069B38186C69A58710227ADFD3CC98F8C5ED7A3DE143017D4A776BD1FB14E53A5D4C54A3316B12BB5CAC261318D689F2C49A95D996A0C16A9D74E502F28AD146968F1713A6F67296FCD727F15854313595629CE392611AC6026BA0A85004A92210CF7A9EA18FF9D494DD557CB294BCC15981332F0BA1478B6BA2BAC583A1C623AF44E3C0BB8C779FCA33F9EF821D4B684D70059466B1A9242B8CB4DBA031269C8FD0EA3AE4946958AF78C4BFFEB579014D276BB527D2D220B1516959C7A3F868A937FADCB735D9443C4BC35CCDDEA7456C2F129CD971A10CFD8D402DCF93650FDE19A8A7FB8AAB7ECB88322C03C4108C5AE51109CCA21C95F8185DED1478D8FF48868E625F47D931F99705B0C075C58FF634A9BA4901739B97AC7DB98F3215DE604524D65CB6337ECB6E41C95D528CA08A19E8EB1070727705B86DC4F39A2F374A5D1C37D3821040B9D5B70B59B136E7409627BC0AB12CA004CAED2C49C47BB849D57E1073C493522A05181029D3CBDB08083BBDDB1000000000000000000000000000000326C38466A5C1BB34AFD6B9F40DF68CA5D000000000000000000000000000000000026FD15D9130F14FBEE2E0D726A637C00000000000000000000000000000098EEE1B55F682003FC26741D8CFB20479400000000000000000000000000000000002836ACD0816B87A4424F80FAD066B20000000000000000000000000000000BCD294161490327C5F767B1A6DF6D1CAF00000000000000000000000000000000002DD5F1289F67EDD3AEDD276B0404B7000000000000000000000000000000542B4FEC217039C45953A7E19A727832420000000000000000000000000000000000047600F1EA0E157DFCA4B31BB5EE87000000000000000000000000000000317F2002B9A8AF09564810144FB5A1448000000000000000000000000000000000000AC63B21EF17EB766F8EFEC095E2880000000000000000000000000000005606F66723DB3BB1189B661AB8137E4E120000000000000000000000000000000000012890BEE421ABDA5827BC16E2725D000000000000000000000000000000F429C874FD7EE8A54A2B8C001BA0F10A8D00000000000000000000000000000000002417E80A2C9244A7845EBCB5CC94AA000000000000000000000000000000A15095571E300AD10970C9E3BF5810101B00000000000000000000000000000000001ABA9EBCD1A053721931ACDFB336C0000000000000000000000000000000C04CA850ADD72954C29DEE4EE56EAE19730000000000000000000000000000000000138ECC957CB8A8E487B8B4341FE5C5000000000000000000000000000000D66D981195E2E0250122F98E1D25DAE56A00000000000000000000000000000000000DBFEAFBF8DD751F489B243458DF03000000000000000000000000000000E2C04DCBE113A4210CD577B72FB20C72A90000000000000000000000000000000000034991D7F50F5D2FE247B3EB7812430000000000000000000000000000000FF92CCE2007B30D86D4B40C24B7B3CE960000000000000000000000000000000000049D5E161DDD4CACDF3CDE221874A0000000000000000000000000000000250FEDD4E2547CB91AF3F7CE4A3750BE83000000000000000000000000000000000000F1C47E22BB218799C1B6A8FD47E400000000000000000000000000000024F1B10AEB12701A5FF4EB35165C614A050000000000000000000000000000000000227D988F3644548FC9F98D26BFDBF30000000000000000000000000000008A12177EB15BCD47DB39539D71D9E1B5A1000000000000000000000000000000000003EDFB88E732723AEAE60A03F74B10000000000000000000000000000000DD1DCC97B9484E0AC156C5F388D470A88800000000000000000000000000000000000D5B8AD798D66534EEBD59D49E369100000000000000000000000000000017F5E6EFAF783B4C9407A09E6FB8BB49B6000000000000000000000000000000000023C23647CDACAD4E298E0E276625530000000000000000000000000000003C62524C10B3DCB0E9F38FB56648F3472E000000000000000000000000000000000014D783F98D74F28824C896185158320000000000000000000000000000006858EBB4C276A3238B7A33D4660DF1FC1700000000000000000000000000000000000CE87D898C3293C11016FCAAB24204000000000000000000000000000000F57EE6406087F4E4C4162141C73BC7B616000000000000000000000000000000000007FB3E08B56B2CE73DA7BEDD6A1F6D0000000000000000000000000000004EE22282A3D21116CB02F4CCC38E860FE20000000000000000000000000000000000107BBA42D90EE46133D31433B8EB19000000000000000000000000000000C40C16DE32312EE6B442DE1587E2A521390000000000000000000000000000000000275E8C801593B8133D81E8019B76830000000000000000000000000000004DBBA681792C938B0791D82AB3C5DD040300000000000000000000000000000000000567B7124F9096012D07F0AC4B3324000000000000000000000000000000944E7C8417401D4761CE4B8881D68513210000000000000000000000000000000000187C3BAC5A378EC6E3857B427E06760000000000000000000000000000004CEFF0535DFC03E966B4A6487FDD69FD25000000000000000000000000000000000029FE419E36A89DEDA5D998E804A49C0000000000000000000000000000005966B853B10D24506C108700D811F577150000000000000000000000000000000000242A7F7BCDA3739C02BC8424C987E000000000000000000000000000000009F2D0C8375C093BE4E8193F02AD05026400000000000000000000000000000000000D0FEC8DC0FA81076F10281C32F15C000000000000000000000000000000565BC6144EE35BB9F284C8C09CB8725833000000000000000000000000000000000026F82CE3DA6578410C2013EB0A8073000000000000000000000000000000534C12D36AC8DED5EA874CE10AB44E507F000000000000000000000000000000000028884281C4B09F056D3B4194668250000000000000000000000000000000FCCC3483B46824AA1BB481E420C403DCF100000000000000000000000000000000001964A1131F0DE57B613DCA32967B5E00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006F9853B4F3F917331D74D259C10608306F0000000000000000000000000000000000269B1DAE9B18D707A85A24E344593200000000000000000000000000000073A16FFC3E0B31779B15A3ACB0FC17FA2A0000000000000000000000000000000000152A4AEB8124CE68909B3544F130C4000000000000000000000000000000BA08B9ADF036EC5594FE1AC363B8E10B5A000000000000000000000000000000000022238F4C7A2CE483B73FD40EB3FCDB000000000000000000000000000000A7F11964B03C3CE244DCAB490326202AD600000000000000000000000000000000000F07B44943550683F9AF5C04988047";

    // The proof with the public inputs removed

    BlakeHonkVerifier referenceVerifier;
    BlakeOptHonkVerifier optVerifier;

    function setUp() public {
        referenceVerifier = new BlakeHonkVerifier();
        optVerifier = new BlakeOptHonkVerifier();
    }

    function testBothImpls() public {
        // A vector of the public inputs
        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = 0x0000000000000000000000000000000000000000000000000000000000000001;
        publicInputs[1] = 0x0000000000000000000000000000000000000000000000000000000000000002;
        publicInputs[2] = 0x0000000000000000000000000000000000000000000000000000000000000003;
        publicInputs[3] = 0x0000000000000000000000000000000000000000000000000000000000000004;

        bool baseVerified = referenceVerifier.verify(proof, publicInputs);
        console.log("baseVerified", baseVerified);
        bool optVerified = optVerifier.verify(proof, publicInputs);
        console.log("optVerified", optVerified);

        assertEq(baseVerified, optVerified);
    }
}